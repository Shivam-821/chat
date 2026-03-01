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
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getGroupByNameApi, getGroupMessagesApi, ChatMessage } from "@/api/api";
import ChatMessages, { DisplayMessage } from "@/components/ChatMessages";

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch group
  useEffect(() => {
    const fetchGroup = async () => {
      if (!token) return;
      const data = await getGroupByNameApi(decodedGroupname, token);
      if (data) setGroup(data);
    };
    fetchGroup();
  }, [token, decodedGroupname]);

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
      }
      setIsInitializing(false);
    };
    loadInitial();
  }, [user?._id, group?._id, token]);

  // Socket: incoming group messages
  useEffect(() => {
    const handler = (data: {
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      message: string;
      createdAt?: string;
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: data.senderId,
          message: data.message,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          createdAt: data.createdAt || new Date().toISOString(),
        },
      ]);
    };
    socket.on("receive-group-message", handler);
    return () => {
      socket.off("receive-group-message", handler);
    };
  }, [socket]);

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
    const payload = {
      senderId: user._id,
      senderName: user.name,
      senderAvatar: user.avatar,
      groupId: group._id,
      groupName: group.name,
      message: inputMessage.trim(),
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
      },
    ]);
    setInputMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
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
    <div className="flex flex-col h-full bg-amber-50 dark:bg-neutral-950 w-full relative">
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
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium tracking-wide">
              {group?.members?.length ?? 0} Members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
          <FaPhoneAlt
            size={18}
            className="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors hover:scale-110"
          />
          <FaVideo
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

      {/* Isolated scrollable messages */}
      <ChatMessages
        messages={messages}
        currentUserId={user?._id ?? ""}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        showSenderInfo={true}
        colorForSender={colorForSender}
        emptyText="No messages yet. Start the conversation! 🎉"
      />

      {/* Input */}
      <div className="shrink-0 p-4 bg-amber-100 dark:bg-neutral-900 border-t border-amber-200 dark:border-neutral-800 w-full">
        <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-full flex items-center px-4 py-2 shadow-sm border border-slate-200 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-amber-400 dark:focus-within:ring-amber-600 transition-shadow">
          <FaSmile className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <FaPaperclip className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
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
    message: m.message,
    senderName: m.sender.name,
    senderAvatar: m.sender.avatar,
    createdAt: m.createdAt,
  };
}

export default GroupChatPage;
