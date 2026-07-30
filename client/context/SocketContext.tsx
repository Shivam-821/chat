"use client";

import { Socket, io } from "socket.io-client";
import { createContext, useContext } from "react";

const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

// autoConnect: false — we connect manually once we have the JWT token
// transports: start with polling (works everywhere), then upgrade to websocket.
// This is the most reliable approach on platforms like Render that use HTTP proxies.
const socketInstance = io(wsUrl, {
  autoConnect: false,
  transports: ["polling", "websocket"],
  upgrade: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

export const SocketContext = createContext<Socket>(socketInstance);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
