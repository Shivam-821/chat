"use client";

import { addContactApi } from "@/api/api";
import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaUserPlus,
  FaSearch,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useMobileLayout } from "@/context/MobileLayoutContext";

const IndiviualPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const { token } = useAuth();
  const { setShowRightSide } = useMobileLayout();

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (!token) return;
      const response = await addContactApi(searchTerm, token);
      if (response) {
        setRequestSent(true);
        setSearchTerm("");
      }
    }
  };

  return (
    <div className="h-[calc(100vh-56px)] w-full flex flex-col items-center justify-between p-8 overflow-y-auto relative">
      {/* Back button for mobile */}
      <button
        onClick={() => setShowRightSide(false)}
        className="md:hidden absolute top-4 left-4 p-2 bg-slate-100 dark:bg-neutral-800 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-neutral-700 transition"
      >
        <FaArrowLeft size={16} />
      </button>

      {/* Top spacer */}
      <div className="flex-1"></div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center gap-6 text-slate-400 dark:text-slate-500 w-full max-w-lg">
        <div className="w-24 h-24 bg-lime-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-default">
          <FaUser size={48} className="text-lime-600 dark:text-lime-500" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2">
            Individual Chat
          </h2>
          <p className="font-medium">
            Select a friend from the sidebar or add a new contact below.
          </p>
        </div>

        {/* Add Contact Form */}
        <form
          onSubmit={handleSendRequest}
          className="w-full mt-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 mb-4">
            <FaUserPlus /> Add a Contact
          </h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <FaSearch size={14} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search username or email..."
                className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <button
              type="submit"
              disabled={!searchTerm.trim()}
              className="bg-lime-600 hover:bg-lime-700 disabled:bg-lime-600/50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Send Request
            </button>
          </div>
          {requestSent && (
            <p className="text-sm text-lime-600 dark:text-lime-400 mt-3 font-medium text-center">
              Request sent successfully!
            </p>
          )}
        </form>
      </div>

      {/* Bottom encryption notice */}
      <div className="flex-1 flex items-end pb-4 min-h-16">
        <p className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 font-bold">
          <FaLock size={12} /> End-to-end encrypted
        </p>
      </div>
    </div>
  );
};

export default IndiviualPage;
