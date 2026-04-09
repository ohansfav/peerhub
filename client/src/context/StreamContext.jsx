import React, { useEffect, useState } from "react";
import { useGetStreamToken } from "../hooks/messaging/useGetStream";
import {
  initStreamClients,
  getStreamClients,
} from "../lib/stream/streamClientManager";
import { useAuth } from "../hooks/useAuthContext";
import { StreamContext } from "../hooks/messaging/useStreamContext";

export function StreamProvider({ children }) {
  const { authUser } = useAuth();
  const { data: tokenData } = useGetStreamToken(authUser);
  const [clients, setClients] = useState(getStreamClients());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      if (!authUser || !tokenData?.token) return;

      const user = {
        id: authUser.id,
        name: `${authUser.firstName} ${authUser.lastName}`,
        image: authUser.profileImageUrl,
      };

      const { chatClient, videoClient } = await initStreamClients(
        user,
        tokenData.token
      );
      setClients({ chatClient, videoClient });
      setIsReady(true);
    };

    setup();
  }, [authUser?.id, tokenData?.token]);

  return (
    <StreamContext.Provider value={{ ...clients, isReady }}>
      {children}
    </StreamContext.Provider>
  );
}
