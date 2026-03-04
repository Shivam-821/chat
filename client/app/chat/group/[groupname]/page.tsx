"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaPhoneAlt,
  FaVideo,
  FaInfoCircle,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
  FaPoll,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getGroupByNameApi,
  getGroupMessagesApi,
  ChatMessage,
  PinnedMessageInfo,
  PollData,
} from "@/api/api";
import ChatMessages, { DisplayMessage } from "@/components/ChatMessages";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ groupname: string }>;
}

const avatarColors = [
  "bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
  "bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-100",
  "bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-100",
  "bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-100",
  "bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-100",
];
const colorForSender = (id: string) =>
  avatarColors[id.charCodeAt(id.length - 1) % avatarColors.length];

const GroupChatPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const decodedGroupname = decodeURIComponent(resolvedParams.groupname);
  const router = useRouter();
  const { token, user } = useAuth();
  const socket = useSocket();

  const [group, setGroup] = useState<any>(null);
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

  // Poll creation dialog state
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

  // Fetch group
  useEffect(() => {
    const fetchGroup = async () => {
      if (!token) return;
      const data = await getGroupByNameApi(decodedGroupname, token);
      if (data) {
        setGroup(data);
      } else {
        // Redirect to main chat area if group not found
        router.push("/chat");
      }
    };
    fetchGroup();
  }, [token, decodedGroupname, router]);

  // Join room + load first 25
  useEffect(() => {
    if (!user?._id || !group?._id || !token) return;
    socket.emit("join-group-room", { groupId: group._id });

    const loadInitial = async () => {
      const res = await getGroupMessagesApi(group._id, 1, token);
      if (res) {
        setMessages(res.messages.map(toDisplay));
        setHasMore(res.hasMore);
        setPage(1);
        if (res.pinnedMessage) setPinnedMessage(res.pinnedMessage);
      }
      setIsInitializing(false);
    };
    loadInitial();
  }, [user?._id, group?._id, token]);

  // Socket: incoming group messages
  useEffect(() => {
    if (!socket) return;

    const handler = (data: {
      _id?: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      message: string;
      createdAt?: string;
      replyOn?: string;
    }) => {
      setMessages((prev) => {
        let replyTo;
        if (data.replyOn) {
          const found = prev.find((m) => m._id === data.replyOn);
          if (found && found._id) {
            replyTo = {
              _id: found._id as string,
              message: found.message,
              senderName: (found.senderName || "User") as string,
            };
          }
        }
        return [
          ...prev,
          {
            _id: data._id,
            senderId: data.senderId,
            message: data.message,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
            createdAt: data.createdAt || new Date().toISOString(),
            replyTo,
          },
        ];
      });
    };

    const editHandler = (data: { messageId: string; newText: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, message: data.newText, edited: true }
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

    const typingHandler = (data: {
      senderId: string;
      senderName: string;
      groupId: string;
    }) => {
      if (data.groupId === group?._id && data.senderId !== user?._id) {
        setTypingUser(data.senderName);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    };

    // Poll listeners
    const pollReceiveHandler = (data: {
      _id: string;
      tempId?: string;
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      createdAt?: string;
      poll: PollData;
    }) => {
      setMessages((prev) => {
        // Replace optimistic message if tempId matches, otherwise append
        if (data.tempId) {
          const exists = prev.find((m) => m._id === data.tempId);
          if (exists) {
            return prev.map((m) =>
              m._id === data.tempId
                ? { ...m, _id: data._id, poll: data.poll }
                : m,
            );
          }
        }
        return [
          ...prev,
          {
            _id: data._id,
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
            message: "",
            createdAt: data.createdAt || new Date().toISOString(),
            poll: data.poll,
          },
        ];
      });
    };

    const pollUpdatedHandler = (data: {
      pollId: string;
      options: { text: string; votes: string[] }[];
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.poll && m.poll._id === data.pollId
            ? { ...m, poll: { ...m.poll, options: data.options } }
            : m,
        ),
      );
    };

    socket.on("receive-group-message", handler);
    socket.on("message-edited", editHandler);
    socket.on("message-deleted", deleteHandler);
    socket.on("message-sent-success", successHandler);
    socket.on("message-reacted", reactionHandler);
    socket.on("message-pinned", pinnedHandler);
    socket.on("message-unpinned", unpinnedHandler);
    socket.on("group-typing", typingHandler);
    socket.on("receive-group-poll", pollReceiveHandler);
    socket.on("poll-updated", pollUpdatedHandler);

    return () => {
      socket.off("receive-group-message", handler);
      socket.off("message-edited", editHandler);
      socket.off("message-deleted", deleteHandler);
      socket.off("message-sent-success", successHandler);
      socket.off("message-reacted", reactionHandler);
      socket.off("message-pinned", pinnedHandler);
      socket.off("message-unpinned", unpinnedHandler);
      socket.off("group-typing", typingHandler);
      socket.off("receive-group-poll", pollReceiveHandler);
      socket.off("poll-updated", pollUpdatedHandler);
    };
  }, [socket, group?._id, user?._id]);

  const handleLoadMore = useCallback(async () => {
    if (!group?._id || !token || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await getGroupMessagesApi(group._id, nextPage, token);
    if (res) {
      setMessages((prev) => [...res.messages.map(toDisplay), ...prev]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    }
    setLoadingMore(false);
  }, [group?._id, token, loadingMore, page]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !user?._id || !group?._id) return;

    if (editingMessageId) {
      socket.emit("edit-message", {
        messageId: editingMessageId,
        newText: inputMessage.trim(),
        groupId: group._id,
      });

      // Optimistic Edit
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === editingMessageId
            ? { ...msg, message: inputMessage.trim(), edited: true }
            : msg,
        ),
      );
      setEditingMessageId(null);
    } else {
      const tempId = Date.now().toString();

      const payload = {
        senderId: user._id,
        senderName: user.name,
        senderAvatar: user.avatar,
        groupId: group._id,
        groupName: group.name,
        message: inputMessage.trim(),
        tempId,
        replyOn: replyingToMessage?._id,
      };

      socket.emit("send-group-message", payload);

      setMessages((prev) => [
        ...prev,
        {
          senderId: user._id,
          message: inputMessage.trim(),
          senderName: user.name,
          senderAvatar: user.avatar,
          createdAt: new Date().toISOString(),
          _id: tempId,
          replyTo: replyingToMessage
            ? {
                _id: replyingToMessage._id!,
                message: replyingToMessage.message,
                senderName: replyingToMessage.senderName || "User",
              }
            : undefined,
        },
      ]);
    }
    setInputMessage("");
    setReplyingToMessage(null);
  };

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
    if (!msg._id || !group?._id) return;
    socket.emit("delete-message", {
      messageId: msg._id,
      groupId: group._id,
    });
    // Optimistic Delete
    setMessages((prev) =>
      prev.map((m) =>
        m._id === msg._id
          ? { ...m, message: "🚫 This message was deleted", deleted: true }
          : m,
      ),
    );
  };

  const handleReactMessage = (msg: DisplayMessage, reaction: string) => {
    if (!msg._id || !group?._id) return;
    socket.emit("react-message", {
      messageId: msg._id,
      groupId: group._id,
      reaction,
    });
  };

  const handlePinMessage = (msg: DisplayMessage) => {
    if (!msg._id || !group?._id || !user?._id) return;
    socket.emit("pin-message", {
      roomId: group._id, // not used for groups, but required by socket type
      messageId: msg._id,
      groupId: group._id,
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
      }, 1200);
    }
  };

  const handleUnpinMessage = () => {
    if (!group?._id) return;
    socket.emit("unpin-message", { roomId: group._id, groupId: group._id });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleVotePoll = (msg: DisplayMessage, optionIndex: number) => {
    if (!msg.poll || !group?._id) return;
    socket.emit("vote-poll", {
      pollId: msg.poll._id,
      groupId: group._id,
      optionIndex,
    });
  };

  const handleCreatePoll = () => {
    if (!user?._id || !group?._id) return;
    const validOptions = pollOptions.filter((o) => o.trim().length > 0);
    if (!pollQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }
    if (validOptions.length < 2) {
      toast.error("Please add at least 2 options");
      return;
    }
    setIsCreatingPoll(true);
    const tempId = Date.now().toString();
    socket.emit("send-poll", {
      groupId: group._id,
      senderId: user._id,
      senderName: user.name,
      senderAvatar: user.avatar,
      question: pollQuestion.trim(),
      options: validOptions,
      allowMultiple: pollAllowMultiple,
      tempId,
    });
    // Optimistic add
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        senderId: user._id,
        senderName: user.name,
        senderAvatar: user.avatar,
        message: "",
        createdAt: new Date().toISOString(),
        poll: {
          _id: tempId,
          question: pollQuestion.trim(),
          allowMultiple: pollAllowMultiple,
          options: validOptions.map((text) => ({ text, votes: [] })),
        },
      },
    ]);
    // Reset dialog
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollAllowMultiple(false);
    setShowPollDialog(false);
    setIsCreatingPoll(false);
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col h-full bg-amber-50 dark:bg-neutral-950 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-300 dark:border-neutral-700 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
            Loading group chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-amber-50 dark:bg-neutral-950 w-full relative overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-amber-200 dark:border-neutral-800 bg-[#e2fbb3] dark:bg-[#1c1c1c] shadow-sm w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-300 dark:bg-neutral-700 rounded-full flex items-center justify-center text-amber-800 dark:text-neutral-300">
            <FaUsers size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {decodedGroupname}
            </h2>
            <p
              className={`text-sm font-medium tracking-wide ${typingUser ? "text-amber-500 animate-pulse" : "text-amber-600 dark:text-amber-400"}`}
            >
              {typingUser
                ? `${typingUser} is typing...`
                : `${group?.members?.length ?? 0} Members`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
          <FaPoll
            onClick={() => setShowPollDialog(true)}
            size={20}
            className="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors hover:scale-110"
          />

          <FaInfoCircle
            onClick={() => router.push(`/chat/group/${decodedGroupname}/info`)}
            size={20}
            className="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors hover:scale-110"
          />
        </div>
      </div>

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="shrink-0 w-full flex items-center gap-3 px-5 py-2 bg-amber-100/80 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900">
          <button
            onClick={scrollToPinnedMessage}
            className="flex items-center gap-3 flex-1 min-w-0 text-left group hover:opacity-80 transition-opacity"
          >
            <span className="text-lg shrink-0">📌</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Pinned by {pinnedMessage.sender.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                {pinnedMessage.message}
              </p>
            </div>
            <span className="text-slate-400 dark:text-slate-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-xs shrink-0 mr-2">
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
            showSenderInfo={true}
            colorForSender={colorForSender}
            emptyText="No messages yet. Start the conversation! 🎉"
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onReplyMessage={handleReplyMessage}
            onReactMessage={handleReactMessage}
            onPinMessage={handlePinMessage}
            onVotePoll={handleVotePoll}
            groupAdminId={group?.admin}
          />
        </div>
      </div>

      {/* Poll Creation Dialog */}
      {showPollDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-700 w-full max-w-md flex flex-col">
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="text-xl">📊</span> Create Poll
              </h2>
              <button
                onClick={() => setShowPollDialog(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
              {/* Question */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask something..."
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-600"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Options
                </label>
                <div className="flex flex-col gap-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-600"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() =>
                            setPollOptions(
                              pollOptions.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-slate-400 hover:text-rose-500 transition-colors text-lg leading-none"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 8 && (
                  <button
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="mt-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium transition-colors"
                  >
                    + Add option
                  </button>
                )}
              </div>

              {/* Vote mode */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Allow multiple votes
                </span>
                <button
                  onClick={() => setPollAllowMultiple(!pollAllowMultiple)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    pollAllowMultiple
                      ? "bg-amber-500 dark:bg-amber-600"
                      : "bg-slate-300 dark:bg-neutral-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      pollAllowMultiple ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 pb-5 pt-3 flex gap-3">
              <button
                onClick={() => setShowPollDialog(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePoll}
                disabled={isCreatingPoll}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isCreatingPoll ? "Creating..." : "Create Poll"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 p-4 bg-amber-100 dark:bg-neutral-900 border-t border-amber-200 dark:border-neutral-800 w-full">
        {editingMessageId && (
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-amber-200 dark:bg-amber-900/50 px-4 py-2 rounded-t-xl mb-[-10px] pb-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50 border-b-0">
            <span className="font-medium flex items-center gap-2">
              <span className="animate-pulse">✏️</span> Editing message
            </span>
            <button
              onClick={() => {
                setEditingMessageId(null);
                setInputMessage("");
              }}
              className="text-amber-600 dark:text-amber-400 hover:text-rose-500 font-bold px-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        {replyingToMessage && !editingMessageId && (
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-amber-200 dark:bg-amber-900/50 px-4 py-2 rounded-t-xl mb-[-10px] pb-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50 border-b-0">
            <div className="flex flex-col flex-1 truncate pr-4">
              <span className="font-bold text-amber-700 dark:text-amber-300 mb-0.5">
                Replying to {replyingToMessage.senderName || "User"}
              </span>
              <span className="truncate opacity-80">
                {replyingToMessage.message}
              </span>
            </div>
            <button
              onClick={() => setReplyingToMessage(null)}
              className="text-amber-600 dark:text-amber-400 hover:text-rose-500 font-bold px-2 transition-colors self-start mt-1"
            >
              Cancel
            </button>
          </div>
        )}
        <div
          className={`max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-full flex items-center px-4 py-2 shadow-sm border border-slate-200 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-amber-400 dark:focus-within:ring-amber-600 transition-shadow relative z-10 ${editingMessageId || replyingToMessage ? "rounded-tl-none rounded-tr-none border-t-0" : ""}`}
        >
          <FaSmile className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <FaPaperclip className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              if (!socket || !user?._id || !group?._id) return;
              const now = Date.now();
              if (now - lastTypingTime.current > 2000) {
                socket.emit("group-typing", {
                  senderId: user._id,
                  senderName: user.name,
                  groupId: group._id,
                });
                lastTypingTime.current = now;
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to the group..."
            className="flex-1 bg-transparent border-none outline-none py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
          <button
            onClick={sendMessage}
            className="bg-amber-400 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 text-slate-900 dark:text-white p-3 rounded-full ml-3 transition-colors shadow-sm transform hover:scale-105"
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
    senderName: m.sender.name,
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
    poll: m.poll
      ? {
          _id: m.poll._id,
          question: m.poll.question,
          allowMultiple: m.poll.allowMultiple,
          options: m.poll.options.map((o) => ({
            text: o.text,
            votes: o.votes,
          })),
        }
      : undefined,
  };
}

export default GroupChatPage;
