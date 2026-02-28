"use client";

import React, { use, useEffect, useState } from "react";
import {
  FaPhoneAlt,
  FaVideo,
  FaInfoCircle,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { getContactsApi } from "@/api/api";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

const IndividualChatPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const decodedUsername = decodeURIComponent(resolvedParams.username);
  const { token } = useAuth();
  const [contact, setContact] = useState<any>(null);

  useEffect(() => {
    const fetchContact = async () => {
      if (!token) return;
      const contacts = await getContactsApi(token);
      if (contacts) {
        const found = contacts.find((c: any) => c.username === decodedUsername);
        if (found) setContact(found);
      }
    };
    fetchContact();
  }, [token, decodedUsername]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-lime-50 dark:bg-neutral-950 w-full relative">
      {/* Chat Header */}
      <div className="h-18 flex items-center justify-between px-6 border-b border-lime-200 dark:border-neutral-800 bg-[#e2fbb3] dark:bg-[#1c1c1c] shadow-sm sticky top-0 z-10 w-full">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-lime-300 dark:bg-neutral-700 border-2 border-lime-400 dark:border-neutral-600 flex items-center justify-center text-xl font-black text-lime-800 dark:text-neutral-200 shrink-0">
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
            {/* Online dot */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#e2fbb3] dark:border-[#1c1c1c] rounded-full ${
                contact?.isOnline ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {contact?.name || decodedUsername}
            </h2>
            <p
              className={`text-sm font-medium tracking-wide ${
                contact?.isOnline
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-400"
              }`}
            >
              {contact?.isOnline ? "Online" : "Offline"}
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

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
        {/* Sample Incoming Message */}
        <div className="flex items-end gap-3 max-w-[80%]">
          <div className="w-8 h-8 rounded-full bg-lime-300 dark:bg-neutral-700 shrink-0 overflow-hidden flex items-center justify-center text-xs font-black text-lime-800 dark:text-neutral-200">
            {contact?.avatar ? (
              <img
                src={contact.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              (contact?.name || decodedUsername).charAt(0).toUpperCase()
            )}
          </div>
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-neutral-700 text-slate-700 dark:text-slate-200">
            <p>Hey! How are you doing today? Just wanted to catch up!</p>
            <span className="text-[10px] text-slate-400 mt-2 block w-full text-right">
              10:45 AM
            </span>
          </div>
        </div>

        {/* Sample Outgoing Message */}
        <div className="flex items-end justify-end gap-3 max-w-[80%] self-end">
          <div className="bg-lime-200 dark:bg-lime-900 p-4 rounded-2xl rounded-br-sm shadow-sm text-slate-800 dark:text-slate-100">
            <p>
              I&apos;m doing great! Just working on this awesome chat
              application. It&apos;s coming together nicely.
            </p>
            <span className="text-[10px] text-lime-700 dark:text-lime-300 mt-2 block w-full text-right">
              10:48 AM
            </span>
          </div>
        </div>
      </div>

      {/* Message Input Area */}
      <div className="p-4 bg-lime-100 dark:bg-neutral-900 border-t border-lime-200 dark:border-neutral-800 w-full">
        <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-full flex items-center px-4 py-2 shadow-sm border border-slate-200 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-lime-400 dark:focus-within:ring-lime-600 transition-shadow">
          <FaSmile className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <FaPaperclip className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <input
            type="text"
            placeholder="Type your message here..."
            className="flex-1 bg-transparent border-none outline-none py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
          <button className="bg-lime-400 hover:bg-lime-500 dark:bg-lime-600 dark:hover:bg-lime-500 text-slate-900 dark:text-white p-3 rounded-full ml-3 transition-colors shadow-sm transform hover:scale-105">
            <FaPaperPlane size={16} className="ml-[-2px] relative top-px" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndividualChatPage;
