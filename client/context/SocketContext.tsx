"use client";

import { Socket, io } from "socket.io-client";
import { createContext, useContext } from "react";

// autoConnect: false — we connect manually once we have the JWT token
const socketInstance = io("http://localhost:3001", {
  autoConnect: false,
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
