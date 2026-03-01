"use client";

import { useSocket } from "@/context/SocketContext";
import { useEffect, useState, useCallback } from "react";
import { FaComment } from "react-icons/fa";

interface ToastNotification {
  id: number;
  senderName: string;
  message: string;
  groupName?: string;
}

const TOAST_DURATION = 2200;

const SocketNotification = () => {
  const socket = useSocket();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (data: {
      senderName: string;
      message: string;
      groupName?: string;
    }) => {
      const id = Date.now();
      setToasts((prev) => [
        ...prev,
        {
          id,
          senderName: data.senderName,
          message: data.message,
          groupName: data.groupName,
        },
      ]);
      setTimeout(() => removeToast(id), TOAST_DURATION);
    };

    socket.on("receive-notification", handler);
    return () => {
      socket.off("receive-notification", handler);
    };
  }, [socket, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-2 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="
            pointer-events-auto
            flex items-center gap-3
            bg-white dark:bg-neutral-800
            border border-lime-200 dark:border-neutral-700
            shadow-[4px_4px_0_0_rgba(0,0,0,0.12)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
            rounded-2xl px-4 py-3 min-w-[240px] max-w-[320px]
            animate-slide-in
          "
          style={{
            animation: "slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-full bg-lime-400 dark:bg-lime-600 flex items-center justify-center shrink-0 shadow-sm">
            <FaComment size={14} className="text-white" />
          </div>

          {/* Content */}
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-bold text-lime-700 dark:text-lime-400 truncate">
              {toast.senderName.split(" ")[0] + " " + toast.senderName.split(" ")[1]}
              {toast.groupName && (
                <span className="font-normal text-slate-700 dark:text-slate-300">
                  {" "}
                  in <span className="font-bold">{toast.groupName}</span>
                </span>
              )}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">
              {"Message..."}
            </p>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default SocketNotification;
