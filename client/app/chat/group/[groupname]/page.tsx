"use client";

import { useRouter } from "next/navigation";
import React, { use } from "react";
import {
  FaUsers,
  FaPhoneAlt,
  FaVideo,
  FaInfoCircle,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
} from "react-icons/fa";

interface PageProps {
  params: Promise<{
    groupname: string;
  }>;
}

const GroupChatPage = ({ params }: PageProps) => {
  // Unwrap the promise using React.use()
  const resolvedParams = use(params);
  // Decode the URL-encoded groupname (e.g., %20 to space)
  const decodedGroupname = decodeURIComponent(resolvedParams.groupname);
  const router = useRouter()

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-amber-50 dark:bg-neutral-950 w-full relative">
      {/* Chat Header */}
      <div className="h-18 flex items-center justify-between px-6 border-b border-amber-200 dark:border-neutral-800 bg-[#e2fbb3] dark:bg-[#1c1c1c] shadow-sm sticky top-0  w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-300 dark:bg-neutral-700 rounded-full flex items-center justify-center text-amber-800 dark:text-neutral-300">
            <FaUsers size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {decodedGroupname}
            </h2>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium tracking-wide">
              5 Members, 3 Online
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

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
        {/* Sample Incoming Message - User 1 */}
        <div className="flex items-end gap-3 max-w-[80%]">
          <div className="w-8 h-8 bg-blue-200 dark:bg-blue-900 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-blue-800 dark:text-blue-100">
            AL
          </div>
          <div>
            <span className="text-xs text-slate-500 mb-1 block ml-2">
              Alice
            </span>
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-neutral-700 text-slate-700 dark:text-slate-200">
              <p>Hey everyone! Welcome to the new group. 🎉</p>
              <span className="text-[10px] text-slate-400 mt-2 block w-full text-right">
                11:00 AM
              </span>
            </div>
          </div>
        </div>

        {/* Sample Incoming Message - User 2 */}
        <div className="flex items-end gap-3 max-w-[80%]">
          <div className="w-8 h-8 bg-rose-200 dark:bg-rose-900 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-rose-800 dark:text-rose-100">
            BO
          </div>
          <div>
            <span className="text-xs text-slate-500 mb-1 block ml-2">Bob</span>
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-neutral-700 text-slate-700 dark:text-slate-200">
              <p>
                Hi Alice! Thanks for setting this up. The UI looks incredibly
                clean and readable.
              </p>
              <span className="text-[10px] text-slate-400 mt-2 block w-full text-right">
                11:05 AM
              </span>
            </div>
          </div>
        </div>

        {/* Sample Outgoing Message */}
        <div className="flex items-end justify-end gap-3 max-w-[80%] self-end">
          <div className="bg-amber-200 dark:bg-amber-900 p-4 rounded-2xl rounded-br-sm shadow-sm text-slate-800 dark:text-slate-100">
            <p>
              Glad you guys made it! Let's use this space to collaborate and
              share updates.
            </p>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 mt-2 block w-full text-right">
              11:07 AM
            </span>
          </div>
        </div>
      </div>

      {/* Message Input Area */}
      <div className="p-4 bg-amber-100 dark:bg-neutral-900 border-t border-amber-200 dark:border-neutral-800 w-full">
        <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-full flex items-center px-4 py-2 shadow-sm border border-slate-200 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-amber-400 dark:focus-within:ring-amber-600 transition-shadow">
          <FaSmile className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <FaPaperclip className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors text-xl mr-3" />
          <input
            type="text"
            placeholder="Type a message to the group..."
            className="flex-1 bg-transparent border-none outline-none py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
          <button className="bg-amber-400 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 text-slate-900 dark:text-white p-3 rounded-full ml-3 transition-colors shadow-sm transform hover:scale-105">
            <FaPaperPlane size={16} className="ml-[-2px] relative top-px" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatPage;
