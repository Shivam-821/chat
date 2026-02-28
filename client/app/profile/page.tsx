"use client";

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaEdit,
  FaCamera,
  FaRegSmile,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaCrown,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import {
  getIncomingRequestsApi,
  updateRequestStatusApi,
  getAdminGroupsApi,
} from "@/api/api";

type TabType = "info" | "requests" | "groups";

const ProfilePage = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  const [requests, setRequests] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    } else if (activeTab === "groups") {
      fetchGroups();
    }
  }, [activeTab, token]);

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    const data = await getIncomingRequestsApi(token);
    if (data) setRequests(data);
    setLoading(false);
  };

  const fetchGroups = async () => {
    if (!token) return;
    setLoading(true);
    const data = await getAdminGroupsApi(token);
    if (data) setGroups(data);
    setLoading(false);
  };

  const handleRequestAction = async (
    requestId: string,
    status: "accepted" | "rejected",
  ) => {
    if (!token) return;
    // Optimistic remove
    setRequests((prev) => prev.filter((req) => req._id !== requestId));
    const success = await updateRequestStatusApi(requestId, status, token);
    if (!success) {
      // Refresh on fail
      fetchRequests();
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] font-bold text-slate-500">
        Sign in to view your profile!
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#f8fafc] dark:bg-neutral-950 p-4 md:p-8 flex flex-col items-center relative overflow-y-auto">
      {/* Subtle playful background elements */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-lime-300/20 dark:bg-lime-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-300/20 dark:bg-amber-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

      <div className="w-full max-w-3xl flex flex-col gap-6 relative z-10">
        {/* Main Profile Header Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 sm:p-10 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(23,23,23,1)] flex flex-col sm:flex-row items-center sm:items-center gap-8 w-full transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_0_rgba(30,41,59,1)] dark:hover:shadow-[10px_10px_0_0_rgba(23,23,23,1)] duration-300">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 bg-lime-100 dark:bg-lime-900/40 rounded-[2rem] rotate-3 border-[3px] border-slate-800 dark:border-neutral-700 flex items-center justify-center shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(23,23,23,1)] overflow-hidden transition-transform group-hover:rotate-6">
              <FaRegSmile
                size={56}
                className="text-slate-800 dark:text-neutral-300 -rotate-3 group-hover:-rotate-6 transition-transform"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-amber-400 hover:bg-amber-300 text-slate-900 p-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(30,41,59,1)] hover:scale-105 transition-transform z-10">
              <FaCamera size={14} />
            </button>
          </div>

          <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
              {user.name}
            </h1>
            <p className="text-slate-600 dark:text-neutral-400 font-bold mb-4 px-4 py-1.5 bg-slate-100 dark:bg-neutral-700/50 rounded-xl inline-block border-2 border-dashed border-slate-300 dark:border-neutral-600">
              @{user.username}
            </p>

            <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-[4px_4px_0_0_rgba(100,116,139,0.5)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(100,116,139,0.5)] dark:hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] flex items-center gap-2 active:shadow-none active:translate-y-[4px] active:translate-x-[4px]">
              <FaEdit size={14} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 w-full overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-5 py-3 font-black rounded-2xl border-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "info"
                ? "bg-sky-200 dark:bg-sky-800 border-slate-800 text-slate-800 dark:text-sky-50 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-y-1 mt-2"
                : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-500 hover:border-slate-300"
            }`}
          >
            <FaUser /> My Info
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-5 py-3 font-black rounded-2xl border-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "requests"
                ? "bg-rose-200 dark:bg-rose-800 border-slate-800 text-slate-800 dark:text-rose-50 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-y-1 mt-2"
                : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-500 hover:border-slate-300"
            }`}
          >
            <FaUsers /> Requests
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-5 py-3 font-black rounded-2xl border-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "groups"
                ? "bg-emerald-200 dark:bg-emerald-800 border-slate-800 text-slate-800 dark:text-emerald-50 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-y-1 mt-2"
                : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-500 hover:border-slate-300"
            }`}
          >
            <FaCrown /> Admin Groups
          </button>
        </div>

        {/* Tab Content Areas */}

        {/* INFO TAB */}
        {activeTab === "info" && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-800 border-[3px] border-slate-200 dark:border-neutral-700">
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/40 border-[3px] border-slate-200 dark:border-slate-700 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 rotate-[-4deg]">
                  <FaEnvelope size={20} className="rotate-[4deg]" />
                </div>
                <div className="pt-1">
                  <p className="text-xs text-slate-500 dark:text-neutral-500 font-bold uppercase tracking-widest mb-1">
                    Email
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-800 border-[3px] border-slate-200 dark:border-neutral-700">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border-[3px] border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 rotate-[4deg]">
                  <FaShieldAlt size={20} className="-rotate-[4deg]" />
                </div>
                <div className="pt-1">
                  <p className="text-xs text-slate-500 dark:text-neutral-500 font-bold uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-slate-200 dark:border-slate-700"></span>
                    <p className="text-slate-800 dark:text-slate-200 font-bold">
                      Account Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900/50 border-[3px] border-slate-200 dark:border-neutral-700 border-dashed">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <span className="text-2xl">👋</span> About Me
              </h3>
              <p className="text-slate-600 dark:text-neutral-400 leading-relaxed font-medium text-lg">
                I'm ready to start chatting!
              </p>
            </div>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === "requests" && (
          <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {loading ? (
              <div className="p-10 text-center font-bold text-slate-500">
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center bg-white dark:bg-neutral-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-700">
                <FaUsers
                  size={48}
                  className="text-slate-300 dark:text-neutral-600 mb-4"
                />
                <p className="font-bold text-slate-500 dark:text-neutral-500">
                  No pending requests right now!
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border-[3px] border-slate-800 dark:border-neutral-700 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(23,23,23,1)] flex flex-col sm:flex-row gap-4 items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime-200 dark:bg-lime-900 rounded-full border-2 border-slate-800 flex items-center justify-center font-black text-xl">
                      {req.sender.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-800 dark:text-slate-100">
                        {req.sender.username}
                      </h4>
                      <p className="text-sm font-bold text-slate-500">
                        {req.sender.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequestAction(req._id, "accepted")}
                      className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold rounded-xl border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(30,41,59,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center gap-2"
                    >
                      <FaCheckCircle /> Accept
                    </button>
                    <button
                      onClick={() => handleRequestAction(req._id, "rejected")}
                      className="px-4 py-2 bg-rose-400 hover:bg-rose-500 text-slate-900 font-bold rounded-xl border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(30,41,59,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center gap-2"
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === "groups" && (
          <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {loading ? (
              <div className="p-10 text-center font-bold text-slate-500">
                Loading Groups...
              </div>
            ) : groups.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center bg-white dark:bg-neutral-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-700">
                <FaCrown
                  size={48}
                  className="text-slate-300 dark:text-neutral-600 mb-4"
                />
                <p className="font-bold text-slate-500 dark:text-neutral-500">
                  You aren't an admin of any groups yet!
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group._id}
                  className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border-[3px] border-slate-800 dark:border-neutral-700 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(23,23,23,1)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 bg-sky-200 dark:bg-sky-900 rounded-xl border-2 border-slate-800 flex items-center justify-center"
                      title="Admin"
                    >
                      <FaCrown
                        className="text-slate-800 dark:text-sky-50"
                        size={20}
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-slate-800 dark:text-slate-100">
                        {group.name}
                      </h4>
                      <p className="text-sm font-bold text-slate-500">
                        {group.members?.length || 0} Members
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-neutral-900 px-3 py-1 font-bold rounded-lg text-slate-500 border border-slate-200 dark:border-neutral-700">
                    Admin
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
