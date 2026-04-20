import React, { useEffect, useState } from "react";
import { useGetStreamToken } from "../hooks/messaging/useGetStream";
import { useAuth } from "../hooks/useAuthContext";
import { StreamContext } from "../hooks/messaging/useStreamContext";

export function StreamProvider({ children }) {
  const { authUser } = useAuth();
  const {
    data: tokenData,
    isLoading: isTokenLoading,
    error: tokenError,
  } = useGetStreamToken(authUser);
  const [clients, setClients] = useState({ chatClient: null, videoClient: null });
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [streamError, setStreamError] = useState(null);

  const hasStreamConfig = Boolean(import.meta.env.VITE_STREAM_API_KEY);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      if (!authUser) {
        setClients({ chatClient: null, videoClient: null });
        setIsReady(false);
        setIsInitializing(false);
        setStreamError(null);
        return;
      }

      if (!hasStreamConfig) {
        setIsReady(false);
        setIsInitializing(false);
        setStreamError("Messaging and virtual classes are not configured for this deployment.");
        return;
      }

      if (tokenError) {
        setIsReady(false);
        setIsInitializing(false);
        setStreamError(tokenError.message || "Failed to initialize messaging.");
        return;
      }

      if (isTokenLoading || !tokenData?.token) {
        return;
      }

      if (tokenData.token === "dummy-stream-token") {
        setIsReady(false);
        setIsInitializing(false);
        setStreamError(
          "Messaging service is currently offline. Please set STREAM_API_KEY and STREAM_API_SECRET on the server."
        );
        return;
      }

      setIsInitializing(true);
      setStreamError(null);

      // Load Stream SDK code only when an authenticated user actually needs it.
      try {
        const { initStreamClients } = await import(
          "../lib/stream/streamClientManager"
        );

        const user = {
          id: authUser.id,
          name: `${authUser.firstName} ${authUser.lastName}`,
          image: authUser?.profileImageUrl || undefined,
        };

        const { chatClient, videoClient } = await initStreamClients(
          user,
          tokenData.token
        );

        if (!cancelled) {
          setClients({ chatClient, videoClient });
          setIsReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setClients({ chatClient: null, videoClient: null });
          setIsReady(false);
          setStreamError(error.message || "Failed to connect to messaging services.");
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    setup();

    return () => {
      cancelled = true;
    };
  }, [
    authUser?.id,
    hasStreamConfig,
    isTokenLoading,
    tokenData?.token,
    tokenError,
  ]);

  return (
    <StreamContext.Provider
      value={{ ...clients, isReady, isInitializing, streamError }}
    >
      {children}
    </StreamContext.Provider>
  );
}
