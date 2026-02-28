"use client"

import React, { useState } from "react";
import {
  FaUsers,
  FaShieldAlt,
  FaCompass,
  FaSearch,
  FaUserPlus,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import { useMobileLayout } from "@/context/MobileLayoutContext";
import { useAuth } from "@/context/AuthContext";
import { searchGroupsApi, requestJoinGroupApi } from "@/api/api";

const GroupPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { _id: string; name: string; members: any[] }[]
  >([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const { setShowRightSide } = useMobileLayout();
  const { token } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q || !token) return;

    setIsSearching(true);
    setHasSearched(true);
    const results = await searchGroupsApi(q, token);
    setSearchResults(results ?? []);
    setIsSearching(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (hasSearched) {
      setHasSearched(false);
      setSearchResults([]);
    }
  };

  const handleRequestJoin = async (groupId: string) => {
    if (!token || sentRequests.has(groupId)) return;
    const success = await requestJoinGroupApi(groupId, token);
    if (success) {
      setSentRequests((prev) => new Set([...prev, groupId]));
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-between p-8 overflow-y-auto relative">
      {/* Back button for mobile */}
      <button
        onClick={() => setShowRightSide(false)}
        className="md:hidden absolute top-4 left-4 p-2 bg-slate-100 dark:bg-neutral-800 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-neutral-700 transition cursor-pointer"
      >
        <FaArrowLeft size={16} />
      </button>

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
                onChange={handleInputChange}
                placeholder="Search groups by name..."
                className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={!searchTerm.trim() || isSearching}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <FaSpinner className="animate-spin" size={14} />
              ) : null}
              Search
            </button>
          </form>

          {/* Search Results */}
          {hasSearched && (
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                Search Results
              </p>

              {isSearching ? (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                  <FaSpinner className="animate-spin" /> Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((group) => (
                  <div
                    key={group._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-800 dark:text-indigo-100 text-sm shrink-0">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {group.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {group.members?.length ?? 0} members
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRequestJoin(group._id)}
                      disabled={sentRequests.has(group._id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border
                        ${
                          sentRequests.has(group._id)
                            ? "bg-slate-100 dark:bg-neutral-800 text-amber-600 dark:text-amber-400 border-transparent cursor-default"
                            : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-amber-300 dark:hover:border-amber-700/50"
                        }
                      `}
                    >
                      {sentRequests.has(group._id) ? (
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
                  No groups found matching &quot;{searchTerm}&quot;
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
