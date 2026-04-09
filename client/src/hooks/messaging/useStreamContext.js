import { createContext, useContext } from "react";

export const StreamContext = createContext(null);

export function useStreamContext() {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
}
