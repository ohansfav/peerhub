import { createContext, useContext } from "react";

export const ChatContext = createContext(null);

const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default useChat;
