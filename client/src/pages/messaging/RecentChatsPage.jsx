import { Chat, ChannelList } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import CustomChannelPreview from "../../components/messaging/ChannelList";
import Spinner from "../../components/common/Spinner";
import useChat from "../../hooks/messaging/useChatContext";
import { useAuth } from "../../hooks/useAuthContext";

const RecentChatsPage = () => {
  const { authUser } = useAuth();
  const { chatClient, isReady } = useChat();

  if (!chatClient || !isReady) return <Spinner />;

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 bg-white border-b px-2 py-3 sm:px-0 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Recent Chats</h1>
        {/* Optional: actions, e.g. new chat button */}
        {/* <button className="text-sm text-blue-600">New Chat</button> */}
      </header>

      <div className="flex-1 overflow-y-auto"></div>
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
  );
};

export default RecentChatsPage;
