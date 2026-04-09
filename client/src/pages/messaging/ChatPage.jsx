import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import ChatLoader from "../../components/ui/ChatLoader";
import generateDmChannelId from "../../utils/generateChannelId";
import CustomChannelHeader from "../../components/messaging/CustomChannelHeader";
import useChat from "../../hooks/messaging/useChatContext";
import { useAuth } from "../../hooks/useAuthContext";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [channel, setChannel] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const { authUser } = useAuth();

  const { chatClient, isReady } = useChat();

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

  if (!chatClient || !channel || isLoading || !isReady) return <ChatLoader />;

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
