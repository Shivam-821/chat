"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

export interface DisplayMessage {
  _id?: string;
  senderId: string;
  message: string;
  senderName?: string;
  senderAvatar?: string;
  createdAt?: string;
  edited?: boolean;
  deleted?: boolean;
  reactions?: { user: string; reaction: string }[];
  replyTo?: {
    _id: string;
    message: string;
    senderName: string;
  };
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
  onEditMessage?: (msg: DisplayMessage) => void;
  onDeleteMessage?: (msg: DisplayMessage) => void;
  onReplyMessage?: (msg: DisplayMessage) => void;
  onReactMessage?: (msg: DisplayMessage, reaction: string) => void;
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
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onReactMessage,
}: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );

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
            <div className="relative group flex items-center">
              {/* Inline Message Options Popup */}
              {selectedMessageId === (msg._id || idx.toString()) && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSelectedMessageId(null)}
                  />
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 ${isSelf ? "right-[105%] mr-2" : "left-[105%] ml-2"} z-50 flex flex-col gap-1 bg-white dark:bg-neutral-800 shadow-xl border border-slate-200 dark:border-neutral-700 rounded-xl p-1.5 min-w-[140px] animate-in fade-in zoom-in duration-200`}
                  >
                    {/* Reaction Picker Row */}
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-slate-100 dark:border-neutral-700">
                      {[
                        "👍",
                        "❤️",
                        "😂",
                        "😮",
                        "😍",
                        "😭",
                        "😉",
                        "👌",
                        "👏",
                        "🤣",
                        "😡",
                      ].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onReactMessage) onReactMessage(msg, emoji);
                            setSelectedMessageId(null);
                          }}
                          className="hover:scale-125 transition-transform text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Only show Edit if within 3 minutes of sending */}
                    {isSelf &&
                      (!msg.createdAt ||
                        Date.now() - new Date(msg.createdAt).getTime() <=
                          3 * 60 * 1000) && (
                        <button
                          onClick={() => {
                            if (onEditMessage) onEditMessage(msg);
                            setSelectedMessageId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-lime-50 dark:hover:bg-neutral-700 rounded-lg transition-colors font-medium flex items-center justify-between"
                        >
                          Edit <span>✏️</span>
                        </button>
                      )}
                    {isSelf && (
                      <button
                        onClick={() => {
                          if (onDeleteMessage) onDeleteMessage(msg);
                          setSelectedMessageId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors font-medium flex items-center justify-between"
                      >
                        Delete <span>🗑️</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (onReplyMessage) onReplyMessage(msg);
                        setSelectedMessageId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-lime-50 dark:hover:bg-neutral-700 rounded-lg transition-colors font-medium flex items-center justify-between"
                    >
                      Reply <span>↩</span>
                    </button>
                  </div>
                </>
              )}

              <div className="flex flex-col">
                {!isSelf && showSenderInfo && msg.senderName && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block ml-1">
                    {msg.senderName}
                  </span>
                )}
                <div
                  onDoubleClick={() => {
                    if (!msg.deleted) {
                      setSelectedMessageId(
                        selectedMessageId === (msg._id || idx.toString())
                          ? null
                          : msg._id || idx.toString(),
                      );
                    }
                  }}
                  className={`p-4 rounded-2xl shadow-sm min-w-[100px] transition-all relative ${
                    isSelf
                      ? "bg-lime-200 dark:bg-lime-900 rounded-br-sm text-slate-800 dark:text-slate-100 cursor-pointer hover:brightness-95"
                      : "bg-white dark:bg-neutral-800 rounded-bl-sm border border-slate-100 dark:border-neutral-700 text-slate-700 dark:text-slate-200 cursor-pointer hover:brightness-95"
                  } ${msg.deleted ? "opacity-60 italic cursor-default" : ""} ${
                    msg.reactions && msg.reactions.length > 0 ? "mb-3" : ""
                  }`}
                >
                  {msg.replyTo && (
                    <div
                      onClick={() => {
                        // In future: could scroll to msg.replyTo._id
                      }}
                      className={`mb-2 p-2 rounded-lg text-xs opacity-90 border-l-[3px] overflow-hidden ${
                        isSelf
                          ? "bg-lime-100/70 dark:bg-lime-950/50 border-lime-600 dark:border-lime-400 text-lime-900 dark:text-lime-200"
                          : "bg-slate-50 dark:bg-neutral-900 border-indigo-400 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <p
                        className={`font-bold opacity-80 mb-0.5 ${isSelf ? "text-lime-700 dark:text-lime-400" : "text-indigo-600 dark:text-indigo-400"}`}
                      >
                        {msg.replyTo.senderName}
                      </p>
                      <p className="line-clamp-2 max-h-8 truncate whitespace-pre-wrap">
                        {msg.replyTo.message}
                      </p>
                    </div>
                  )}

                  {msg.deleted ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      🚫 This message was deleted
                    </p>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  )}

                  {msg.reactions && msg.reactions.length > 0 && (
                    <div
                      className={`absolute -bottom-3.5 flex flex-wrap gap-1 z-10 ${
                        isSelf ? "right-2" : "left-2"
                      }`}
                    >
                      {Object.entries(
                        msg.reactions.reduce(
                          (acc, r) => {
                            if (!acc[r.reaction])
                              acc[r.reaction] = { count: 0, me: false };
                            acc[r.reaction].count += 1;
                            if (r.user === currentUserId)
                              acc[r.reaction].me = true;
                            return acc;
                          },
                          {} as Record<string, { count: number; me: boolean }>,
                        ),
                      ).map(([emoji, { count, me }]) => (
                        <button
                          key={emoji}
                          disabled={msg.deleted}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onReactMessage && !msg.deleted)
                              onReactMessage(msg, emoji);
                          }}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[12px] font-bold border transition-colors shadow-sm ${
                            !showSenderInfo
                              ? "bg-transparent border-transparent shadow-none text-[14px]"
                              : me
                                ? "bg-lime-200 border-lime-400 text-lime-900 dark:bg-lime-900 dark:border-lime-700 dark:text-lime-200"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-neutral-800 dark:border-neutral-600 dark:text-slate-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          <span>{emoji}</span>
                          {showSenderInfo && count > 1 && (
                            <span className="opacity-90">{count}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`mt-1 flex items-center gap-1.5 ${
                      isSelf ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.edited && !msg.deleted && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        (edited)
                      </span>
                    )}
                    {msg.createdAt && (
                      <p
                        className={`text-[10px] font-medium ${
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
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
