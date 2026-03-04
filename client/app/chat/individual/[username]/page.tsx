"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaPhoneAlt,
  FaVideo,
  FaInfoCircle,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import {
  getContactsApi,
  getIndividualMessagesApi,
  getKeysApi,
  ChatMessage,
  PinnedMessageInfo,
} from "@/api/api";
import { useSocket } from "@/context/SocketContext";
import { useE2E } from "@/context/E2EContext";
import ChatMessages, { DisplayMessage } from "@/components/ChatMessages";

interface PageProps {
  params: Promise<{ username: string }>;
}

const IndividualChatPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const decodedUsername = decodeURIComponent(resolvedParams.username);
  const { token, user } = useAuth();
  const socket = useSocket();

  const [contact, setContact] = useState<any>(null);
  const [contactPublicKey, setContactPublicKey] = useState<any>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimer = React.useRef<NodeJS.Timeout | null>(null);
  const lastTypingTime = React.useRef(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] =
    useState<DisplayMessage | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<PinnedMessageInfo | null>(
    null,
  );
  const pinnedHighlightTimer = React.useRef<NodeJS.Timeout | null>(null);

  const { encryptMsg, decryptMsg, isE2EReady } = useE2E();

  const router = useRouter();

  // Fetch contact
  useEffect(() => {
    const fetchContact = async () => {
      if (!token) return;
      const contacts = await getContactsApi(token);
      if (contacts) {
        const found = contacts.find((c: any) => c.username === decodedUsername);
        if (found) {
          setContact(found);
          const keys = await getKeysApi(found._id, token);
          if (keys?.publicKey) setContactPublicKey(keys.publicKey);
        } else {
          // If the user isn't in contacts, redirect away
          router.push("/chat");
        }
      } else {
        router.push("/chat");
      }
    };
    fetchContact();
  }, [token, decodedUsername, router]);

  const decryptPayload = useCallback(
    async (msgText: string) => {
      if (!contactPublicKey || !isE2EReady) return msgText;
      try {
        const parsed = JSON.parse(msgText);
        if (parsed.ciphertext && parsed.iv) {
          const decrypted = await decryptMsg(parsed, contactPublicKey);
          return decrypted || "[Decryption Error]";
        }
      } catch (e) {
        // Normal plaintext message fallback
      }
      return msgText;
    },
    [contactPublicKey, decryptMsg, isE2EReady],
  );

  const processMessages = useCallback(
    async (msgs: ChatMessage[]) => {
      const processed = [];
      for (const m of msgs) {
        const displayMsg = toDisplay(m);
        displayMsg.message = await decryptPayload(m.message);
        if (displayMsg.replyTo?.message) {
          displayMsg.replyTo.message = await decryptPayload(
            displayMsg.replyTo.message,
          );
        }
        processed.push(displayMsg);
      }
      return processed;
    },
    [decryptPayload],
  );

  // Join room + load first 25 messages
  useEffect(() => {
    if (!user?._id || !contact?._id || !token || !contactPublicKey) return;
    socket.emit("join-room", { userId: user._id, receiverId: contact._id });

    const loadInitial = async () => {
      const res = await getIndividualMessagesApi(
        user._id,
        contact._id,
        1,
        token,
      );
      if (res) {
        const processed = await processMessages(res.messages);
        setMessages(processed);
        setHasMore(res.hasMore);
        setPage(1);
        if (res.pinnedMessage) {
          const decryptedPinnedText = await decryptPayload(
            res.pinnedMessage.message,
          );
          setPinnedMessage({
            ...res.pinnedMessage,
            message: decryptedPinnedText,
          });
        }
      }
      setIsInitializing(false);
    };
    loadInitial();
  }, [user?._id, contact?._id, token, contactPublicKey, processMessages]);

  // Socket: incoming messages
  useEffect(() => {
    if (!socket) return;

    const handler = async (data: {
      _id?: string;
      senderId: string;
      message: string;
      createdAt?: string;
      replyOn?: string;
    }) => {
      const plaintext = await decryptPayload(data.message);
      setMessages((prev) => {
        let replyTo;
        if (data.replyOn) {
          const found = prev.find((m) => m._id === data.replyOn);
          if (found && found._id) {
            replyTo = {
              _id: found._id as string,
              message: found.message,
              senderName: (found.senderName ||
                (found.senderId === user?._id ? user?.name : contact?.name) ||
                "User") as string,
            };
          }
        }
        return [
          ...prev,
          {
            _id: data._id,
            senderId: data.senderId,
            message: plaintext,
            createdAt: data.createdAt || new Date().toISOString(),
            replyTo,
          },
        ];
      });
    };

    const editHandler = async (data: {
      messageId: string;
      newText: string;
    }) => {
      const plaintext = await decryptPayload(data.newText);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, message: plaintext, edited: true }
            : msg,
        ),
      );
    };

    const deleteHandler = (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, message: "🚫 This message was deleted", deleted: true }
            : msg,
        ),
      );
    };

    const successHandler = (data: { tempId: string; realId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.tempId ? { ...msg, _id: data.realId } : msg,
        ),
      );
    };

    const reactionHandler = (data: {
      messageId: string;
      reactions: { user: string; reaction: string }[];
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg,
        ),
      );
    };

    const pinnedHandler = (data: {
      messageId: string;
      pinnedPersonName?: string;
    }) => {
      setMessages((prev) => {
        const found = prev.find((m) => m._id === data.messageId);
        if (found) {
          setPinnedMessage({
            _id: data.messageId,
            message: found.message,
            sender: { name: data.pinnedPersonName || "Someone" },
          });
        }
        return prev;
      });
    };

    const unpinnedHandler = () => setPinnedMessage(null);

    const typingHandler = (data: { senderId: string }) => {
      if (data.senderId === contact?._id) {
        setTypingUser(data.senderId);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    };

    socket.on("receive-message", handler);
    socket.on("message-edited", editHandler);
    socket.on("message-deleted", deleteHandler);
    socket.on("message-sent-success", successHandler);
    socket.on("message-reacted", reactionHandler);
    socket.on("message-pinned", pinnedHandler);
    socket.on("message-unpinned", unpinnedHandler);
    socket.on("typing", typingHandler);

    return () => {
      socket.off("receive-message", handler);
      socket.off("message-edited", editHandler);
      socket.off("message-deleted", deleteHandler);
      socket.off("message-sent-success", successHandler);
      socket.off("message-reacted", reactionHandler);
      socket.off("message-pinned", pinnedHandler);
      socket.off("message-unpinned", unpinnedHandler);
      socket.off("typing", typingHandler);
    };
  }, [socket, decryptPayload, contact?._id]);

  // Load older messages
  const handleLoadMore = useCallback(async () => {
    if (
      !user?._id ||
      !contact?._id ||
      !token ||
      loadingMore ||
      !contactPublicKey
    )
      return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await getIndividualMessagesApi(
      user._id,
      contact._id,
      nextPage,
      token,
    );
    if (res) {
      const processed = await processMessages(res.messages);
      setMessages((prev) => [...processed, ...prev]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    }
    setLoadingMore(false);
  }, [
    user?._id,
    contact?._id,
    token,
    loadingMore,
    page,
    contactPublicKey,
    processMessages,
  ]);

  const sendMessage = async () => {
    if (
      !inputMessage.trim() ||
      !user?._id ||
      !contact?._id ||
      !user.name ||
      !isE2EReady ||
      !contactPublicKey
    )
      return;

    const plaintext = inputMessage.trim();
    const encryptedData = await encryptMsg(plaintext, contactPublicKey);

    if (!encryptedData) {
      alert("Failed to encrypt message");
      return;
    }

    if (editingMessageId) {
      socket.emit("edit-message", {
        messageId: editingMessageId,
        newText: JSON.stringify(encryptedData),
        receiverId: contact._id,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === editingMessageId
            ? { ...msg, message: plaintext, edited: true }
            : msg,
        ),
      );
      setEditingMessageId(null);
    } else {
      const tempId = Date.now().toString();

      const payload = {
        senderId: user._id,
        receiverId: contact._id,
        message: JSON.stringify(encryptedData),
        senderName: user.name,
        tempId,
        replyOn: replyingToMessage?._id,
      };

      socket.emit("send-message", payload);

      setMessages((prev) => [
        ...prev,
        {
          senderId: user._id,
          message: plaintext,
          createdAt: new Date().toISOString(),
          _id: tempId,
          replyTo: replyingToMessage
            ? {
                _id: replyingToMessage._id!,
                message: replyingToMessage.message,
                senderName:
                  replyingToMessage.senderId === user._id
                    ? user.name
                    : contact?.name || decodedUsername,
              }
            : undefined,
        },
      ]);
    }

    setInputMessage("");
    setReplyingToMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col h-full bg-lime-50 dark:bg-neutral-950 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-lime-300 dark:border-neutral-700 border-t-lime-600 dark:border-t-lime-400 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
            Loading secure chat...
          </p>
        </div>
      </div>
    );
  }

  const handleEditMessage = (msg: DisplayMessage) => {
    if (!msg._id) return;
    setInputMessage(msg.message);
    setReplyingToMessage(null);
    setEditingMessageId(msg._id);
  };

  const handleReplyMessage = (msg: DisplayMessage) => {
    setEditingMessageId(null);
    setInputMessage("");
    setReplyingToMessage(msg);
  };

  const handleDeleteMessage = (msg: DisplayMessage) => {
    if (!msg._id) return;
    socket.emit("delete-message", {
      messageId: msg._id,
      receiverId: contact?._id,
    });
    // Optimistic Delete Update
    setMessages((prev) =>
      prev.map((m) =>
        m._id === msg._id
          ? { ...m, message: "🚫 This message was deleted", deleted: true }
          : m,
      ),
    );
  };

  const handleReactMessage = (msg: DisplayMessage, reaction: string) => {
    if (!msg._id || !contact?._id) return;
    socket.emit("react-message", {
      messageId: msg._id,
      receiverId: contact._id,
      reaction,
    });
  };

  const handlePinMessage = (msg: DisplayMessage) => {
    if (!msg._id || !user?._id || !contact?._id) return;
    const roomId = [user._id, contact._id].sort().join("_");
    socket.emit("pin-message", {
      roomId,
      messageId: msg._id,
      pinnedPersonName: user.name,
    });
  };

  const scrollToPinnedMessage = () => {
    if (!pinnedMessage) return;
    const el = document.querySelector(
      `[data-message-id="${pinnedMessage._id}"]`,
    ) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("pinned-highlight");
      if (pinnedHighlightTimer.current)
        clearTimeout(pinnedHighlightTimer.current);
      pinnedHighlightTimer.current = setTimeout(() => {
        el.classList.remove("pinned-highlight");
      }, 400);
    }
  };

  const handleUnpinMessage = () => {
    if (!user?._id || !contact?._id) return;
    const roomId = [user._id, contact._id].sort().join("_");
    socket.emit("unpin-message", { roomId });
  };

  return (
    <div className="flex flex-col h-full bg-lime-50 dark:bg-neutral-950 w-full relative overflow-hidden">
      {/* Chat Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-lime-200 dark:border-neutral-800 bg-[#e2fbb3] dark:bg-[#1c1c1c] shadow-sm z-10 w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-lime-300 dark:bg-neutral-700 border-2 border-lime-400 dark:border-neutral-600 flex items-center justify-center text-xl font-black text-lime-800 dark:text-neutral-200 shrink-0">
            {contact?.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name || decodedUsername}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {(contact?.name || decodedUsername).charAt(0).toUpperCase()}
              </span>
            )}
            <span
              className={`absolute top-11 left-15 w-3 h-3 border-2 border-[#e2fbb3] dark:border-[#1c1c1c] rounded-full ${contact?.isOnline ? "bg-emerald-500" : "bg-slate-400"}`}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {contact?.name || decodedUsername}
            </h2>
            <p
              className={`text-sm font-medium tracking-wide ${typingUser ? "text-amber-500 animate-pulse" : contact?.isOnline ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}
            >
              {typingUser
                ? "Typing..."
                : contact?.isOnline
                  ? "Online"
                  : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
          <FaPhoneAlt
            size={18}
            className="cursor-pointer hover:text-lime-600 dark:hover:text-lime-400 transition-colors hover:scale-110"
          />
          <FaVideo
            size={20}
            className="cursor-pointer hover:text-lime-600 dark:hover:text-lime-400 transition-colors hover:scale-110"
          />
          <FaInfoCircle
            size={20}
            className="cursor-pointer hover:text-lime-600 dark:hover:text-lime-400 transition-colors hover:scale-110"
          />
        </div>
      </div>

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="shrink-0 w-full flex items-center gap-3 px-5 py-2 bg-lime-100/80 dark:bg-lime-950/40 border-b border-lime-200 dark:border-lime-900">
          <button
            onClick={scrollToPinnedMessage}
            className="flex items-center gap-3 flex-1 min-w-0 text-left group hover:opacity-80 transition-opacity"
          >
            <span className="text-lg shrink-0">📌</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-lime-700 dark:text-lime-400 uppercase tracking-wide">
                Pinned by {pinnedMessage.sender.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                {pinnedMessage.message}
              </p>
            </div>
            <span className="text-slate-400 dark:text-slate-600 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors text-xs shrink-0 mr-2">
              ↗
            </span>
          </button>
          <button
            onClick={handleUnpinMessage}
            title="Unpin message"
            className="shrink-0 text-slate-400 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Isolated scrollable messages */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col">
          <ChatMessages
            messages={messages}
            currentUserId={user?._id ?? ""}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
            contact={contact}
            emptyText="No messages yet. Say hi! 👋"
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onReplyMessage={handleReplyMessage}
            onReactMessage={handleReactMessage}
            onPinMessage={handlePinMessage}
          />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 bg-lime-100 dark:bg-neutral-900 border-t border-lime-200 dark:border-neutral-800 w-full">
        {editingMessageId && (
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-lime-200 dark:bg-lime-900/50 px-4 py-2 rounded-t-xl mb-[-10px] pb-3 text-sm text-lime-800 dark:text-lime-200 border border-lime-300 dark:border-lime-700/50 border-b-0">
            <span className="font-medium flex items-center gap-2">
              <span className="animate-pulse">✏️</span> Editing message
            </span>
            <button
              onClick={() => {
                setEditingMessageId(null);
                setInputMessage("");
              }}
              className="text-lime-600 dark:text-lime-400 hover:text-rose-500 font-bold px-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        {replyingToMessage && !editingMessageId && (
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-lime-200 dark:bg-lime-900/50 px-4 py-2 rounded-t-xl mb-[-10px] pb-3 text-sm text-lime-800 dark:text-lime-200 border border-lime-300 dark:border-lime-700/50 border-b-0">
            <div className="flex flex-col flex-1 truncate pr-4">
              <span className="font-bold text-lime-700 dark:text-lime-300 mb-0.5">
                Replying to{" "}
                {replyingToMessage.senderId === user?._id
                  ? "yourself"
                  : replyingToMessage.senderName ||
                    contact?.name ||
                    decodedUsername}
              </span>
              <span className="truncate opacity-80">
                {replyingToMessage.message}
              </span>
            </div>
            <button
              onClick={() => setReplyingToMessage(null)}
              className="text-lime-600 dark:text-lime-400 hover:text-rose-500 font-bold px-2 transition-colors self-start mt-1"
            >
              Cancel
            </button>
          </div>
        )}
        <div
          className={`max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-full flex items-center px-4 py-2 shadow-sm border border-slate-200 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-lime-400 dark:focus-within:ring-lime-600 transition-shadow relative z-10 ${editingMessageId || replyingToMessage ? "rounded-tl-none rounded-tr-none border-t-0" : ""}`}
        >
          <FaSmile className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <FaPaperclip className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              if (!socket || !user?._id || !contact?._id) return;
              const now = Date.now();
              if (now - lastTypingTime.current > 2000) {
                socket.emit("typing", {
                  senderId: user._id,
                  receiverId: contact._id,
                });
                lastTypingTime.current = now;
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 bg-transparent border-none outline-none py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
          <button
            onClick={sendMessage}
            className="bg-lime-400 hover:bg-lime-500 dark:bg-lime-600 dark:hover:bg-lime-500 text-slate-900 dark:text-white p-3 rounded-full ml-3 transition-colors shadow-sm transform hover:scale-105"
          >
            <FaPaperPlane size={16} className="ml-[-2px] relative top-px" />
          </button>
        </div>
      </div>
    </div>
  );
};

function toDisplay(m: ChatMessage): DisplayMessage {
  return {
    _id: m._id,
    senderId: m.sender._id,
    message: m.deleted ? "🚫 This message was deleted" : m.message,
    senderAvatar: m.sender.avatar,
    createdAt: m.createdAt,
    edited: m.edited,
    deleted: m.deleted,
    reactions: m.reactions,
    replyTo: m.replyOn
      ? {
          _id: m.replyOn._id,
          message: m.replyOn.message,
          senderName: m.replyOn.sender?.name || "User",
        }
      : undefined,
  };
}

export default IndividualChatPage;
