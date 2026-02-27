"use client";

import React, { use } from "react";
import {
  FaUser,
  FaPhoneAlt,
  FaVideo,
  FaInfoCircle,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
} from "react-icons/fa";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

const IndividualChatPage = ({ params }: PageProps) => {
  // Unwrap the promise using React.use()
  const resolvedParams = use(params);
  // Decode the URL-encoded username (e.g., %20 to space)
  const decodedUsername = decodeURIComponent(resolvedParams.username);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-lime-50 dark:bg-neutral-950 w-full relative">
      {/* Chat Header */}
      <div className="h-18 flex items-center justify-between px-6 border-b border-lime-200 dark:border-neutral-800 bg-[#e2fbb3] dark:bg-[#1c1c1c] shadow-sm sticky top-0 z-10 w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-lime-300 dark:bg-neutral-700 rounded-full flex items-center justify-center text-lime-700 dark:text-neutral-300">
            <FaUser size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {decodedUsername}
            </h2>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium tracking-wide">
              Online
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
          <div className="w-8 h-8 bg-lime-300 dark:bg-neutral-700 rounded-full shrink-0 flex items-center justify-center text-xs text-lime-700 dark:text-neutral-300">
            <FaUser />
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
              I'm doing great! Just working on this awesome chat application.
              It's coming together nicely.
            </p>
            <span className="text-[10px] text-lime-700 dark:text-lime-300 mt-2 block w-full text-right">
              10:48 AM
            </span>
          </div>
        </div>

        {/* Sample Incoming Message */}
        <div className="flex items-end gap-3 max-w-[80%]">
          <div className="w-8 h-8 bg-lime-300 dark:bg-neutral-700 rounded-full shrink-0 flex items-center justify-center text-xs text-lime-700 dark:text-neutral-300">
            <FaUser />
          </div>
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-neutral-700 text-slate-700 dark:text-slate-200">
            <p>
              That sounds amazing! I can't wait to see the final result. The
              styling looks fantastic already.
            </p>
            <span className="text-[10px] text-slate-400 mt-2 block w-full text-right">
              10:50 AM
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
