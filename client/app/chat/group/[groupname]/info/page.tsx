"use client";

import React, { use, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getGroupByIdApi,
  getGroupByNameApi,
  leaveGroupApi,
  deleteGroupApi,
  addMembersApi,
  getContactsApi,
} from "@/api/api";
import {
  FaUsers,
  FaArrowLeft,
  FaSearch,
  FaSignOutAlt,
  FaUserCircle,
  FaUserPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

interface PageProps {
  params: Promise<{
    groupname: string;
  }>;
}

const GroupInfoPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const groupId = decodeURIComponent(resolvedParams.groupname);
  const router = useRouter();
  const { token, user } = useAuth();

  const [group, setGroup] = useState<any>(null);
  const [groupIdForApi, setGroupIdForApi] = useState<string>(""); // real MongoDB _id for mutations
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Add Members Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  const isAdmin = group?.admin?.toString() === user?._id?.toString();

  const refreshGroup = async () => {
    if (!token) return;
    const data = await getGroupByNameApi(groupId, token);
    if (data) {
      setGroup(data);
      setGroupIdForApi(data._id);
    }
  };

  const handleLeaveOrDelete = async () => {
    if (!token || !groupIdForApi) return;
    setIsSubmitting(true);
    let success = false;

    if (isAdmin) {
      success = await deleteGroupApi(groupIdForApi, token);
    } else {
      success = await leaveGroupApi(groupIdForApi, token);
    }

    setIsSubmitting(false);
    if (success) {
      router.push("/chat");
    }
  };

  const handleOpenAddModal = async () => {
    if (!token) return;
    // Load contacts not already in the group
    const allContacts = await getContactsApi(token);
    if (allContacts) {
      const memberIds = group?.members?.map((m: any) => m._id) ?? [];
      const filtered = allContacts.filter(
        (c: any) => !memberIds.includes(c._id),
      );
      setContacts(filtered);
    }
    setSelectedToAdd([]);
    setIsAddModalOpen(true);
  };

  const toggleSelectAdd = (id: string) => {
    setSelectedToAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAddMembers = async () => {
    if (!token || selectedToAdd.length === 0 || !groupIdForApi) return;
    setIsAddingMembers(true);
    const updatedGroup = await addMembersApi(
      groupIdForApi,
      selectedToAdd,
      token,
    );
    setIsAddingMembers(false);
    if (updatedGroup) {
      setGroup(updatedGroup);
      setIsAddModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchGroupInfo = async () => {
      if (!token) return;

      const data = await getGroupByNameApi(groupId, token);
      if (data) {
        setGroup(data);
        setGroupIdForApi(data._id);
      }
      setLoading(false);
    };

    fetchGroupInfo();
  }, [groupId, token]);

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#f8fafc] dark:bg-neutral-950 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#f8fafc] dark:bg-neutral-950 items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Group Not Found
        </h2>
        <button
          onClick={() => router.back()}
          className="text-amber-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#f8fafc] dark:bg-neutral-950 overflow-y-auto overflow-x-hidden relative">
      {/* Playful Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-amber-300/20 dark:bg-amber-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-[30%] right-[-10%] w-96 h-96 bg-lime-300/20 dark:bg-lime-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      </div>

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
              {group.name}
            </h2>
            <p className="text-slate-500 dark:text-neutral-400 font-bold mb-4">
              Group · {group.members?.length || 0} Members
            </p>
            <p className="text-slate-600 dark:text-neutral-300 font-medium bg-amber-50 dark:bg-neutral-700/50 p-4 rounded-2xl border-2 border-dashed border-amber-200 dark:border-neutral-600 w-full">
              Welcome to {group.name}! This is a collaborative space for team
              updates, general chat, and sharing resources.
            </p>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(23,23,23,1)]">
          <div className="flex items-center justify-between mx-2 mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {group.members?.length || 0} Members
            </h3>
            {isAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="text-lime-700 dark:text-lime-400 font-bold flex items-center gap-2 hover:bg-lime-50 dark:hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors border-2 border-transparent hover:border-lime-200 dark:hover:border-neutral-600"
              >
                <FaUserPlus size={14} /> Add Members
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {group.members?.map((member: any) => (
              <div
                key={member._id}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-700/50 transition-colors border-2 border-transparent hover:border-slate-200 dark:hover:border-neutral-700 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-slate-200 dark:bg-neutral-700 border-2 border-slate-800 dark:border-neutral-600 flex items-center justify-center shrink-0 overflow-hidden font-black text-slate-600 dark:text-slate-300 text-lg`}
                >
                  {member.name ? (
                    member.name.charAt(0).toUpperCase()
                  ) : (
                    <FaUserCircle
                      size={28}
                      className="text-slate-800/80 dark:text-white/80"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {member.name || "Unknown User"}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">
                    @{member.username}
                  </p>
                </div>
                {group.admin?.toString() === member._id?.toString() && (
                  <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700 px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        {isAdmin ? (
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-center text-sm font-bold text-slate-500 dark:text-neutral-400">
              As the administrator, you cannot leave the group. You must delete
              it entirely.
            </p>
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSubmitting}
              className="w-full bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-black p-5 rounded-3xl border-[3px] border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              <FaTrash size={18} />
              Delete Group
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={isSubmitting}
            className="w-full bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-black p-5 rounded-3xl border-[3px] border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-3 transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            <FaSignOutAlt size={20} />
            Leave Group
          </button>
        )}
      </div>

      {/* Confirm Leave/Delete Modal */}
      {isConfirmModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-3xl p-6 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-300 dark:border-rose-700 mx-auto mb-4">
                {isAdmin ? (
                  <FaTrash
                    size={22}
                    className="text-rose-600 dark:text-rose-400"
                  />
                ) : (
                  <FaSignOutAlt
                    size={22}
                    className="text-rose-600 dark:text-rose-400"
                  />
                )}
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 text-center mb-2">
                {isAdmin ? "Delete Group?" : "Leave Group?"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-neutral-400 text-center mb-6">
                {isAdmin
                  ? `This will permanently delete "${group.name}" and remove all members. This action cannot be undone.`
                  : `Are you sure you want to leave "${group.name}"? You'll need to be added back by an admin.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-100 dark:bg-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-600 text-slate-800 dark:text-slate-200 font-black py-3 rounded-xl border-2 border-slate-300 dark:border-neutral-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleLeaveOrDelete();
                    setIsConfirmModalOpen(false);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl border-2 border-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0_0_rgba(159,18,57,1)] hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0_0_rgba(159,18,57,1)] active:shadow-none"
                >
                  {isSubmitting
                    ? "Processing..."
                    : isAdmin
                      ? "Yes, Delete"
                      : "Yes, Leave"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Add Members Modal via Portal */}
      {isAddModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-3xl p-6 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>

              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">
                Add Members
              </h2>
              <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">
                Select contacts to add to <strong>{group.name}</strong>
              </p>

              <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4">
                {contacts.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-neutral-400 py-6 text-sm">
                    All your contacts are already in this group!
                  </p>
                ) : (
                  contacts.map((contact: any) => (
                    <div
                      key={contact._id}
                      onClick={() => toggleSelectAdd(contact._id)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-xl cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedToAdd.includes(contact._id)}
                        onChange={() => {}}
                        className="w-5 h-5 accent-lime-500 cursor-pointer"
                      />
                      <div className="w-9 h-9 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center font-bold text-amber-800 dark:text-amber-100 text-sm shrink-0">
                        {contact.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          @{contact.username}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={handleAddMembers}
                disabled={isAddingMembers || selectedToAdd.length === 0}
                className="w-full bg-slate-800 hover:bg-slate-700 dark:bg-lime-400 dark:hover:bg-lime-300 text-white dark:text-slate-900 font-black text-base py-3 rounded-xl border-2 border-transparent dark:border-slate-800 shadow-[4px_4px_0_0_rgba(100,116,139,0.5)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(100,116,139,0.5)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingMembers
                  ? "Adding..."
                  : `Add ${selectedToAdd.length > 0 ? selectedToAdd.length : ""} Member${selectedToAdd.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default GroupInfoPage;
