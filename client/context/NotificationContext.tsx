"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getUnreadNotificationsCountApi } from "@/api/api";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { token, isAuthenticated } = useAuth();

  const fetchUnreadCount = async () => {
    if (!token || !isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    const unread = await getUnreadNotificationsCountApi(token);
    if (unread) {
      setUnreadCount(unread.length || 0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Setting up a basic interval to poll for new notifications every 60 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        fetchUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
