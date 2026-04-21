// src/lib/stream/streamClientManager.js
import { StreamChat } from "stream-chat";
import { StreamVideoClient } from "@stream-io/video-react-sdk";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const isInvalidStreamApiKey = (value) => {
  const apiKey = String(value || "").trim();
  if (!apiKey) return true;

  const blockedPlaceholders = [
    "your-stream-api-key",
    "stream-api-key",
    "changeme",
    "example",
  ];

  return blockedPlaceholders.includes(apiKey.toLowerCase());
};

let chatClient = null;
let videoClient = null;

/**
 * Initialize or reuse existing chat + video clients.
 */
export async function initStreamClients(user, token) {
  if (isInvalidStreamApiKey(STREAM_API_KEY)) {
    throw new Error(
      "VITE_STREAM_API_KEY is missing or placeholder. Set the real Stream API key in client/.env and restart the frontend server."
    );
  }

  if (!token || token === "dummy-stream-token") {
    throw new Error("Valid Stream token is unavailable. Check backend Stream configuration.");
  }

  // Chat
  if (!chatClient) {
    chatClient = StreamChat.getInstance(STREAM_API_KEY);
    // await chatClient.connectUser(user, token);
  }

  if (!chatClient.userID) {
    await chatClient.connectUser(user, token);
  }

  // Video
  if (!videoClient) {
    videoClient = StreamVideoClient.getOrCreateInstance({
      apiKey: STREAM_API_KEY,
      user,
      token,
    });
  }

  return { chatClient, videoClient };
}

/**
 * Get currently active clients.
 */
export function getStreamClients() {
  return { chatClient, videoClient };
}

/**
 * Disconnect all clients (for logout or global teardown).
 */
export async function disconnectStreamClients() {
  if (chatClient) {
    await chatClient.disconnectUser().catch(console.error);
    chatClient = null;
  }
  if (videoClient) {
    await videoClient.disconnectUser?.().catch(console.error);
    videoClient = null;
  }
}
