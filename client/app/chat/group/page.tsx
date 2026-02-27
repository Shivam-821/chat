"use client";

import React, { useState } from "react";
import {
  FaUsers,
  FaShieldAlt,
  FaCompass,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";

const GroupPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [requestedGroupId, setRequestedGroupId] = useState<string | null>(null);

  // Mock data for groups
  const mockGroups = [
    { id: "g1", name: "Developers Lounge", members: 124 },
    { id: "g2", name: "Next.js Enthusiasts", members: 89 },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setHasSearched(true);
    }
  };

  const handleRequestJoin = (groupId: string) => {
    // Future: integrate API request here
    setRequestedGroupId(groupId);
    setTimeout(() => setRequestedGroupId(null), 3000); // Reset after 3 seconds for demo
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-between p-8 overflow-y-auto">
      {/* Top spacer */}
      <div className="flex-1"></div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center gap-6 text-slate-400 dark:text-slate-500 w-full max-w-xl">
        <div className="w-24 h-24 bg-amber-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-default">
          <FaUsers size={48} className="text-amber-500 dark:text-amber-400" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2">
            Group Chat
          </h2>
          <p className="font-medium">
            Select a group from the sidebar or discover new communities below.
          </p>
        </div>

        {/* Discover Groups Section */}
        <div className="w-full mt-6 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 mb-4">
            <FaCompass /> Discover Groups
          </h3>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <FaSearch size={14} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHasSearched(false);
                }}
                placeholder="Search groups by name..."
                className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={!searchTerm.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {/* Search Results */}
          {hasSearched && (
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                Search Results
              </p>
              {mockGroups.filter((g) =>
                g.name.toLowerCase().includes(searchTerm.toLowerCase()),
              ).length > 0 ? (
                mockGroups
                  .filter((g) =>
                    g.name.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {group.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {group.members} members
                        </p>
                      </div>
                      <button
                        onClick={() => handleRequestJoin(group.id)}
                        disabled={requestedGroupId === group.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border
                          ${
                            requestedGroupId === group.id
                              ? "bg-slate-100 dark:bg-neutral-800 text-amber-600 dark:text-amber-400 border-transparent cursor-default"
                              : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-amber-300 dark:hover:border-amber-700/50"
                          }
                        `}
                      >
                        {requestedGroupId === group.id ? (
                          "Request Sent"
                        ) : (
                          <>
                            <FaUserPlus size={12} /> Join
                          </>
                        )}
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No groups found matching "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom encryption notice */}
      <div className="flex-1 flex items-end pb-4 min-h-16">
        <p className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 font-bold">
          <FaShieldAlt size={14} /> Securely encrypted for groups
        </p>
      </div>
    </div>
  );
};

export default GroupPage;
