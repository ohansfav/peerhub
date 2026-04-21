import { Chat, ChannelList } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CustomChannelPreview from "../../components/messaging/ChannelList";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import useChat from "../../hooks/messaging/useChatContext";
import { useAuth } from "../../hooks/useAuthContext";
import { getLocalConversations } from "../../lib/api/common/localChatApi";

const RecentChatsPage = () => {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const { chatClient, isReady, isInitializing, streamError } = useChat();
  const isOfflineMode = Boolean(streamError);

  const {
    data: localConversations,
    isLoading: isLocalLoading,
    error: localError,
  } = useQuery({
    queryKey: ["localChat", "conversations"],
    queryFn: getLocalConversations,
    enabled: isOfflineMode,
    staleTime: 1000 * 5,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });

  if (isOfflineMode && localError) {
    return (
      <div className="p-4 sm:p-0">
        <ErrorAlert error={localError} />
      </div>
    );
  }

  if (isOfflineMode) {
    if (isLocalLoading) return <Spinner />;

    return (
      <div className="flex flex-col h-full">
        <header className="sticky top-0 z-10 bg-white border-b px-2 py-3 sm:px-0 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Recent Chats</h1>
        </header>

        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-2">
          Offline mode: using local in-app messaging fallback.
        </div>

        <div className="mt-3 border rounded-lg divide-y bg-white">
          {(localConversations || []).length === 0 ? (
            <div className="text-center py-6 text-gray-500">You have no chats yet.</div>
          ) : (
            (localConversations || []).map((item) => {
              const other = item.otherUser;
              const rolePrefix = authUser.role === "tutor" ? "/tutor" : "/student";
              return (
                <button
                  key={other.id}
                  type="button"
                  onClick={() => navigate(`${rolePrefix}/chat/${other.id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {other.firstName} {other.lastName}
                      </div>
                      <div className="text-sm text-gray-600 truncate max-w-[220px]">
                        {item.lastMessage?.text || "No messages yet"}
                      </div>
                    </div>
                    {item.unreadCount > 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-primary text-white">
                        {item.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (isInitializing || (!chatClient && !isReady)) return <Spinner />;

  if (!chatClient || !isReady) {
    return (
      <div className="p-4 sm:p-0 text-gray-600">
        Messaging is currently unavailable. Please try again shortly.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 bg-white border-b px-2 py-3 sm:px-0 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Recent Chats</h1>
        {/* Optional: actions, e.g. new chat button */}
        {/* <button className="text-sm text-blue-600">New Chat</button> */}
      </header>

      <div className="flex-1 min-h-0">
        <Chat client={chatClient} theme="messaging light">
          <ChannelList
            Preview={CustomChannelPreview}
            filters={{ members: { $in: [authUser.id] } }}
            sort={{ last_message_at: -1 }}
            EmptyStateIndicator={() => (
              <div className="no-chats text-center py-4">
                You have no chats yet.
              </div>
            )}
          />
        </Chat>
      </div>
    </div>
  );
};

export default RecentChatsPage;
