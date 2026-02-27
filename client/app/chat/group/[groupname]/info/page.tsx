"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaArrowLeft,
  FaBell,
  FaImage,
  FaLink,
  FaSearch,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

interface PageProps {
  params: Promise<{
    groupname: string;
  }>;
}

const GroupInfoPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const decodedGroupname = decodeURIComponent(resolvedParams.groupname);
  const router = useRouter();

  const mockMembers = [
    {
      id: 1,
      name: "Alice",
      role: "Admin",
      color: "bg-blue-200 dark:bg-blue-900",
    },
    {
      id: 2,
      name: "Bob",
      role: "Member",
      color: "bg-rose-200 dark:bg-rose-900",
    },
    {
      id: 3,
      name: "Charlie",
      role: "Member",
      color: "bg-emerald-200 dark:bg-emerald-900",
    },
    {
      id: 4,
      name: "Diana",
      role: "Member",
      color: "bg-purple-200 dark:bg-purple-900",
    },
    {
      id: 5,
      name: "Evan",
      role: "Member",
      color: "bg-amber-200 dark:bg-amber-900",
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#f8fafc] dark:bg-neutral-950 overflow-y-auto relative">
      {/* Playful Background Elements */}
      <div className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-amber-300/20 dark:bg-amber-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute top-[30%] right-[-10%] w-96 h-96 bg-lime-300/20 dark:bg-lime-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b-[3px] border-slate-800 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md sticky top-0 z-20 w-full shadow-[0_4px_0_0_rgba(30,41,59,0.05)] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.5)] py-1.5">
        <button
          onClick={() => router.back()}
          className="p-2 mr-4 bg-slate-100 dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 rounded-xl border-2 border-slate-800 dark:border-neutral-700 shadow-[2px_2px_0_0_rgba(30,41,59,1)] dark:shadow-[2px_2px_0_0_rgba(23,23,23,1)] transition-transform active:translate-y-px active:translate-x-px active:shadow-none"
        >
          <FaArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Group Info
        </h1>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto p-6 flex flex-col gap-8 relative z-10">
        {/* Main Info Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(23,23,23,1)] flex flex-col items-center sm:flex-row sm:items-start gap-8">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-amber-200 dark:bg-amber-900/40 rounded-[2rem] -rotate-3 border-[3px] border-slate-800 dark:border-neutral-700 flex items-center justify-center shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(23,23,23,1)] overflow-hidden shrink-0">
            <FaUsers
              size={64}
              className="text-amber-600 dark:text-amber-400 rotate-3"
            />
          </div>

          <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left mt-2">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">
              {decodedGroupname}
            </h2>
            <p className="text-slate-500 dark:text-neutral-400 font-bold mb-4">
              Group · {mockMembers.length} Members
            </p>
            <p className="text-slate-600 dark:text-neutral-300 font-medium bg-amber-50 dark:bg-neutral-700/50 p-4 rounded-2xl border-2 border-dashed border-amber-200 dark:border-neutral-600 w-full">
              Welcome to {decodedGroupname}! This is a collaborative space for
              team updates, general chat, and sharing resources.
            </p>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(23,23,23,1)]">
          <div className="flex items-center justify-between mx-2 mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {mockMembers.length} Members
            </h3>
            <button className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors border-2 border-transparent hover:border-amber-200 dark:hover:border-neutral-600">
              <FaSearch size={14} /> Find
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {mockMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-neutral-700 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${member.color} border-2 border-slate-800 dark:border-neutral-600 flex items-center justify-center shrink-0`}
                >
                  <FaUserCircle
                    size={28}
                    className="text-slate-800/80 dark:text-white/80"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {member.name}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">
                    Never gonna give you up...
                  </p>
                </div>
                {member.role === "Admin" && (
                  <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700 px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <button className="w-full bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-black p-5 rounded-3xl border-[3px] border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-3 transition-colors mb-8">
          <FaSignOutAlt size={20} />
          Leave Group
        </button>
      </div>
    </div>
  );
};

export default GroupInfoPage;
