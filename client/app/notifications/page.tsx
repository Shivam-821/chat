"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  Notification,
  getNotificationsApi,
  markNotificationAsReadApi,
  deleteNotificationApi,
} from "@/api/api";
import {
  BellRing,
  CheckCircle2,
  Trash2,
  UserPlus,
  HandMetal,
  CalendarCheck,
  Megaphone,
} from "lucide-react";

type TabType = "all" | "request" | "greeting" | "task" | "random";

const NotificationPage = () => {
  const { token, isAuthenticated } = useAuth();
  const { fetchUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const loadNotifications = async () => {
    setLoading(true);
    if (!token) return;
    const data = await getNotificationsApi(token);
    if (data) {
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setNotifications(sorted);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadNotifications();
    }
  }, [isAuthenticated, token]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    const success = await markNotificationAsReadApi(id, token);
    if (success) {
      fetchUnreadCount(); // update navbar badge
    } else {
      // revert if failed
      loadNotifications();
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    const success = await deleteNotificationApi(id, token);
    if (success) {
      fetchUnreadCount();
    } else {
      // revert if failed
      loadNotifications();
    }
  };

  const filteredNotifications = useMemo(() => {
    // The user requested that we ONLY show unread messages on this page
    const unreadOnly = notifications.filter((n) => !n.read);

    if (activeTab === "all") return unreadOnly;
    return unreadOnly.filter((n) => n.notificationType === activeTab);
  }, [notifications, activeTab]);

  const getIconForType = (type: string) => {
    switch (type) {
      case "request":
        return <UserPlus className="text-blue-500" />;
      case "greeting":
        return <HandMetal className="text-emerald-500" />;
      case "task":
        return <CalendarCheck className="text-purple-500" />;
      default:
        return <Megaphone className="text-amber-500" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <BellRing className="w-8 h-8 text-rose-500" />
          Unread Notifications
        </h1>
        <p className="text-slate-500 font-bold mt-2">
          Catch up on what you&apos;ve missed!
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "request", "greeting", "task", "random"] as TabType[]).map(
          (tab) => {
            // Calculate how many unread are in this specific tab
            const count = notifications.filter(
              (n) =>
                !n.read && (tab === "all" ? true : n.notificationType === tab),
            ).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl font-bold capitalize transition-all border-2 ${
                  activeTab === tab
                    ? "bg-lime-300 dark:bg-lime-800 border-lime-400 dark:border-lime-700 text-slate-900 dark:text-lime-50 shadow-[2px_2px_0_0_rgba(30,41,59,1)] dark:shadow-[2px_2px_0_0_rgba(0,0,0,1)] -translate-y-[2px]"
                    : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-700"
                }`}
              >
                {tab}{" "}
                {count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab
                        ? "bg-slate-800 text-lime-300 dark:bg-lime-200 dark:text-slate-900"
                        : "bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-neutral-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          },
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4 pb-12">
        {loading ? (
          <div className="w-full h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="w-full h-40 flex flex-col items-center justify-center bg-white dark:bg-neutral-800 rounded-2xl border-2 border-slate-200 dark:border-neutral-700 border-dashed">
            <BellRing className="w-12 h-12 text-slate-300 dark:text-neutral-600 mb-3" />
            <p className="font-bold text-slate-400 dark:text-neutral-500">
              No unread {activeTab !== "all" ? activeTab : ""} notifications!
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className="bg-white dark:bg-neutral-800 p-5 mt-1 rounded-2xl border-[3px] border-slate-800 dark:border-neutral-700 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(23,23,23,1)] flex gap-4 items-start transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:hover:shadow-[6px_6px_0_0_rgba(23,23,23,1)]"
            >
              <div className="p-3 bg-slate-100 dark:bg-neutral-900 rounded-xl border-2 border-slate-200 dark:border-neutral-800">
                {getIconForType(notif.notificationType)}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">
                    {notif.title}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-neutral-900 px-2 py-1 rounded-md">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {notif.content}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  title="Mark as read"
                  className="p-2 border-2 border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-colors group"
                >
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => handleDelete(notif._id)}
                  title="Delete notification"
                  className="p-2 border-2 border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-colors group"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
