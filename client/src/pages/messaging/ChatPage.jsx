import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import ChatLoader from "../../components/ui/ChatLoader";
import ErrorAlert from "../../components/common/ErrorAlert";
import generateDmChannelId from "../../utils/generateChannelId";
import CustomChannelHeader from "../../components/messaging/CustomChannelHeader";
import useChat from "../../hooks/messaging/useChatContext";
import { useAuth } from "../../hooks/useAuthContext";
import {
  getLocalThread,
  markLocalThreadRead,
  sendLocalMessage,
} from "../../lib/api/common/localChatApi";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [channel, setChannel] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [offlineText, setOfflineText] = useState("");

  const { authUser } = useAuth();
  const queryClient = useQueryClient();

  const { chatClient, isReady, isInitializing, streamError } = useChat();
  const isOfflineMode = Boolean(streamError);

  const {
    data: offlineThread,
    isLoading: isOfflineLoading,
    error: offlineError,
  } = useQuery({
    queryKey: ["localChat", "thread", targetUserId],
    queryFn: () => getLocalThread(targetUserId),
    enabled: isOfflineMode && !!targetUserId,
    staleTime: 1000 * 3,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });

  const sendOfflineMessageMutation = useMutation({
    mutationFn: ({ userId, text }) => sendLocalMessage({ userId, text }),
    onSuccess: async () => {
      setOfflineText("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["localChat", "thread", targetUserId] }),
        queryClient.invalidateQueries({ queryKey: ["localChat", "conversations"] }),
      ]);
    },
  });

  useEffect(() => {
    if (!isReady || !chatClient || !authUser || !targetUserId) return;

    const initChannel = async () => {
      try {
        setLoading(true);
        const channelId = await generateDmChannelId(authUser.id, targetUserId);
        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser.id, targetUserId],
        });
        await currChannel.watch();
        setChannel(currChannel);
      } catch (error) {
        console.error("Failed to initialize channel:", error);
      } finally {
        setLoading(false);
      }
    };

    initChannel();

    // Cleanup
    return () => {
      if (channel) {
        channel.stopWatching().catch(console.error);
      }
    };
  }, [isReady, chatClient, authUser, targetUserId]);

  useEffect(() => {
    if (!isOfflineMode || !targetUserId) return;
    markLocalThreadRead(targetUserId).catch(() => {});
  }, [isOfflineMode, targetUserId]);

  if (isOfflineMode) {
    if (offlineError) {
      return (
        <div className="p-4 sm:p-0">
          <ErrorAlert error={offlineError} />
        </div>
      );
    }

    if (isOfflineLoading) {
      return <ChatLoader />;
    }

    const otherUser = offlineThread?.otherUser;
    const messages = offlineThread?.messages || [];

    return (
      <div className="fixed inset-0 top-16 left-0 lg:left-64 flex flex-col bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="font-semibold text-gray-900">
              {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Chat"}
            </div>
            <div className="text-xs text-amber-700">Offline mode messaging fallback</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No messages yet.</div>
          ) : (
            messages.map((msg) => {
              const mine = msg.senderId === authUser.id;
              return (
                <div
                  key={msg.id}
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                    mine
                      ? "ml-auto bg-primary text-white"
                      : "mr-auto bg-white border text-gray-800"
                  }`}
                >
                  <div>{msg.text}</div>
                  <div className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const text = offlineText.trim();
            if (!text) return;
            sendOfflineMessageMutation.mutate({ userId: targetUserId, text });
          }}
          className="border-t bg-white p-3 flex items-center gap-2"
        >
          <input
            value={offlineText}
            onChange={(e) => setOfflineText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={sendOfflineMessageMutation.isPending}
            className="btn bg-primary hover:bg-primary-focus text-white"
          >
            Send
          </button>
        </form>
      </div>
    );
  }

  if (isInitializing || !chatClient || !channel || isLoading || !isReady) {
    return <ChatLoader />;
  }

  return (
    <div className="fixed inset-0 top-16 left-0 lg:left-64 flex flex-col bg-white">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="flex flex-col h-full relative">
            <Window>
              {/* Fixed header */}
              <div className="flex-shrink-0">
                <CustomChannelHeader channel={channel} authUser={authUser} />
              </div>

              {/* Scrollable message area */}
              <div className="flex-1 overflow-hidden">
                <MessageList />
              </div>

              {/* Fixed input */}
              <div className="flex-shrink-0">
                <MessageInput focus />
              </div>
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
