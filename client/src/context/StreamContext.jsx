import React, { useEffect, useState } from "react";
import { useGetStreamToken } from "../hooks/messaging/useGetStream";
import { useAuth } from "../hooks/useAuthContext";
import { StreamContext } from "../hooks/messaging/useStreamContext";

const isInvalidStreamApiKey = (value) => {
  const apiKey = String(value || "").trim();
  if (!apiKey) return true;

  const blockedPlaceholders = [
    "your-stream-api-key",
    "stream-api-key",
    "changeme",
    "example",
  ];

  if (blockedPlaceholders.includes(apiKey.toLowerCase())) return true;

  return false;
};

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

  const streamApiKey = import.meta.env.VITE_STREAM_API_KEY;
  const hasValidStreamConfig = !isInvalidStreamApiKey(streamApiKey);

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

      if (!hasValidStreamConfig) {
        setIsReady(false);
        setIsInitializing(false);
        setStreamError(
          "VITE_STREAM_API_KEY is missing or still set to placeholder value. Add your real Stream Chat API key in client/.env and restart Vite."
        );
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
          const rawMessage = String(error?.message || "");
          const isApiKeyError =
            rawMessage.includes("api_key not valid") ||
            rawMessage.includes("WS failed with code 2");

          setStreamError(
            isApiKeyError
              ? "Stream rejected your API key. Ensure VITE_STREAM_API_KEY matches the same Stream app used by STREAM_API_KEY and STREAM_API_SECRET on the server."
              : error.message || "Failed to connect to messaging services."
          );
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
    hasValidStreamConfig,
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
