// src/lib/stream/streamClientManager.js
import { StreamChat } from "stream-chat";
import { StreamVideoClient } from "@stream-io/video-react-sdk";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

let chatClient = null;
let videoClient = null;

/**
 * Initialize or reuse existing chat + video clients.
 */
export async function initStreamClients(user, token) {
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
