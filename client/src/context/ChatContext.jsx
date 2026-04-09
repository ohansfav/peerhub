import { ChatContext } from "../hooks/messaging/useChatContext";
import { useStreamContext } from "../hooks/messaging/useStreamContext";

export function ChatProvider({ children }) {
  const { chatClient, isReady } = useStreamContext();

  return (
    <ChatContext.Provider value={{ chatClient, isReady }}>
      {children}
    </ChatContext.Provider>
  );
}
