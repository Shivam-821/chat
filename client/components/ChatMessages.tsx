"use client";

import React, { useEffect, useRef, useCallback } from "react";

export interface DisplayMessage {
  _id?: string;
  senderId: string;
  message: string;
  senderName?: string;
  senderAvatar?: string;
  createdAt?: string;
}

interface ChatMessagesProps {
  messages: DisplayMessage[];
  currentUserId: string;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  /** For individual chats: avatar/name of the other person */
  contact?: { name?: string; username?: string; avatar?: string };
  /** For group chats: render per-message avatar */
  showSenderInfo?: boolean;
  colorForSender?: (id: string) => string;
  emptyText?: string;
}

const ChatMessages = ({
  messages,
  currentUserId,
  hasMore,
  loadingMore,
  onLoadMore,
  contact,
  showSenderInfo = false,
  colorForSender,
  emptyText = "No messages yet.",
}: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  // Scroll to bottom on first load only
  useEffect(() => {
    if (messages.length > 0 && isFirstLoad.current) {
      bottomRef.current?.scrollIntoView();
      isFirstLoad.current = false;
    }
  }, [messages.length]);

  // Expose scroll-to-bottom for new messages
  useEffect(() => {
    if (!isFirstLoad.current && messages.length > 0) {
      const el = scrollRef.current;
      if (!el) return;
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom)
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 30 || !hasMore || loadingMore) return;

    const prevScrollHeight = el.scrollHeight;
    onLoadMore();
    // Restore scroll position after prepend (parent updates state, then we fix position)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - prevScrollHeight;
      });
    });
  }, [hasMore, loadingMore, onLoadMore]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overscroll-contain p-6 flex flex-col gap-4 custom-scrollbar"
      style={{ minHeight: 0 }}
    >
      {loadingMore && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-1 animate-pulse">
          Loading older messages…
        </p>
      )}
      {!hasMore && messages.length > 0 && (
        <p className="text-center text-xs text-slate-300 dark:text-slate-600 py-1">
          Beginning of conversation
        </p>
      )}
      {messages.length === 0 && !loadingMore && (
        <div className="flex-1 flex items-center justify-center opacity-40">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {emptyText}
          </p>
        </div>
      )}

      {messages.map((msg, idx) => {
        const isSelf = msg.senderId === currentUserId;
        const initials = msg.senderName?.slice(0, 2).toUpperCase() ?? "??";
        const displayName = contact?.name || contact?.username || "";

        return (
          <div
            key={msg._id || idx}
            className={`flex items-end gap-3 max-w-[80%] animate-chat-message ${isSelf ? "self-end justify-end" : "self-start"}`}
          >
            {!isSelf && (
              <div
                className={`w-8 h-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold border-2 border-white dark:border-neutral-700 ${
                  colorForSender
                    ? colorForSender(msg.senderId)
                    : "bg-lime-300 dark:bg-neutral-700 text-lime-800 dark:text-neutral-200"
                }`}
              >
                {msg.senderAvatar || contact?.avatar ? (
                  <img
                    src={msg.senderAvatar ?? contact?.avatar}
                    alt={msg.senderName ?? displayName}
                    className="w-full h-full object-cover"
                  />
                ) : showSenderInfo ? (
                  initials
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
            )}
            <div>
              {!isSelf && showSenderInfo && msg.senderName && (
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block ml-1">
                  {msg.senderName}
                </span>
              )}
              <div
                className={`p-4 rounded-2xl shadow-sm min-w-[80px] ${
                  isSelf
                    ? "bg-lime-200 dark:bg-lime-900 rounded-br-sm text-slate-800 dark:text-slate-100"
                    : "bg-white dark:bg-neutral-800 rounded-bl-sm border border-slate-100 dark:border-neutral-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                {msg.createdAt && (
                  <p
                    className={`text-[10px] mt-1 text-right font-medium ${
                      isSelf
                        ? "text-lime-700 dark:text-lime-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
