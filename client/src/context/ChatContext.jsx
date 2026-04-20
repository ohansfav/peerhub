import { ChatContext } from "../hooks/messaging/useChatContext";
import { useStreamContext } from "../hooks/messaging/useStreamContext";

export function ChatProvider({ children }) {
  const { chatClient, isReady, isInitializing, streamError } = useStreamContext();

  return (
    <ChatContext.Provider
      value={{ chatClient, isReady, isInitializing, streamError }}
    >
      {children}
    </ChatContext.Provider>
  );
}
