"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { getContactsApi, createGroupApi, getMyGroupsApi } from "@/api/api";
import { FaUserFriends, FaPlus, FaTimes } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { useMobileLayout } from "@/context/MobileLayoutContext";
import toast from "react-hot-toast";

const SideBar = () => {
  const { token, isAuthenticated } = useAuth();
  const { setShowRightSide } = useMobileLayout();
  const [contacts, setContacts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isGroupRoute = pathname.includes("/chat/group");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsCreating(true);
    const newGroup = await createGroupApi(groupName, selectedMembers, token!);
    if (newGroup) {
      setIsModalOpen(false);
      setGroupName("");
      setSelectedMembers([]);
      setShowRightSide(true);
      router.push(`/chat/group/${encodeURIComponent(newGroup.name)}`);
    }
    setIsCreating(false);
  };

  const toggleMemberSelection = (contactId: string) => {
    if (selectedMembers.includes(contactId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== contactId));
    } else {
      setSelectedMembers([...selectedMembers, contactId]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !isAuthenticated) {
        setLoading(false);
        return;
      }

      const contactsData = await getContactsApi(token);
      if (contactsData) {
        setContacts(contactsData);
      }

      if (isGroupRoute) {
        const groupsData = await getMyGroupsApi(token);
        if (groupsData) {
          setGroups(groupsData);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [token, isAuthenticated, isGroupRoute]);

  if (loading) {
    return (
      <div className="sticky left-0 top-16 h-[calc(100vh-57px)] w-full md:w-74 bg-[#eafcc5] dark:bg-neutral-900 overflow-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="sticky left-0 top-16 h-[calc(100vh-57px)] w-full md:w-74 bg-[#eafcc5] dark:bg-neutral-900 overflow-auto overscroll-contain">
      {!pathname.includes("/individual") && (
        <div className="flex justify-between items-center px-4 py-3 border-b-2 border-amber-200 dark:border-neutral-700 bg-[#eafcc5] dark:bg-neutral-900 sticky top-0 z-10">
          <h2 className="font-black text-lg text-slate-800 dark:text-slate-200">
            {isGroupRoute ? "Groups" : "Contacts"}
          </h2>
          {
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center bg-lime-400 hover:bg-lime-500 dark:bg-lime-500 dark:hover:bg-lime-600 text-black border-2 border-black dark:border-white dark:text-white rounded-full transition-transform hover:scale-110 active:scale-95 shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,1)]"
              title="Create New Group"
            >
              <FaPlus size={14} />
            </button>
          }
        </div>
      )}

      {isGroupRoute ? (
        groups.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-70">
            <FaUserFriends
              size={48}
              className="text-lime-700 dark:text-lime-500 mb-4"
            />
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No groups yet!
            </p>
            <p className="text-sm font-medium text-slate-600 dark:text-neutral-400 mt-2">
              Create a group to start chatting.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div
              onClick={() => {
                setShowRightSide(true);
                router.push(`/chat/group/${encodeURIComponent(group.name)}`);
              }}
              key={group._id}
              className="h-18 border-y border-amber-200 dark:border-neutral-700 flex items-center gap-5 px-3 hover:bg-lime-200/50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center text-xl font-black text-indigo-800 dark:text-indigo-100 border-2 border-indigo-300 dark:border-indigo-700">
                  {group.name ? group.name.charAt(0).toUpperCase() : "G"}
                </div>
              </div>

              <div className="flex flex-col flex-1 overflow-hidden">
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate">
                  {group.name}
                </p>
                <p className="text-xs font-medium text-slate-500 truncate">
                  {group.members?.length || 0} members
                </p>
              </div>
            </div>
          ))
        )
      ) : contacts.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-70">
          <FaUserFriends
            size={48}
            className="text-lime-700 dark:text-lime-500 mb-4"
          />
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No contacts yet!
          </p>
          <p className="text-sm font-medium text-slate-600 dark:text-neutral-400 mt-2">
            Send a contact request from your Profile to start chatting.
          </p>
        </div>
      ) : (
        contacts.map((contact) => (
          <div
            onClick={() => {
              setShowRightSide(true);
              router.push(`/chat/individual/${contact.username}`);
            }}
            key={contact._id}
            className="h-18 border-y border-amber-200 dark:border-neutral-700 flex items-center gap-5 px-3 hover:bg-lime-200/50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center text-xl font-black text-amber-800 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-700 overflow-hidden">
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name || contact.username}
                    className="w-full h-full object-cover"
                  />
                ) : contact.name ? (
                  contact.name.charAt(0).toUpperCase()
                ) : (
                  "?"
                )}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#eafcc5] dark:border-neutral-900 rounded-full ${contact.isOnline ? "bg-emerald-500" : "bg-slate-400"}`}
                title={contact.isOnline ? "Online" : "Offline"}
              ></span>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate">
                {contact.name}
              </p>
              <p className="text-xs font-medium text-slate-500 truncate">
                @{contact.username}
              </p>
            </div>
          </div>
        ))
      )}

      {/* Create Group Modal */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-3xl p-6 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>

              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
                Create New Group
              </h2>

              <form
                onSubmit={handleCreateGroup}
                className="flex flex-col gap-4 flex-1 overflow-hidden"
              >
                <div className="flex flex-col gap-2 shrink-0">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="The Cool Kids Club"
                    required
                    className="w-full bg-slate-50 dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-600 focus:border-lime-400 dark:focus:border-lime-500 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-colors font-medium cursor-text"
                  />
                </div>

                <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                    Select Members ({selectedMembers.length})
                  </label>
                  <div className="bg-slate-50 dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-600 rounded-xl overflow-y-auto flex-1 p-2">
                    {contacts.length === 0 ? (
                      <p className="text-center text-slate-500 text-sm py-4">
                        You don&apos;t have any contacts to add.
                      </p>
                    ) : (
                      contacts.map((contact) => (
                        <div
                          key={contact._id}
                          onClick={() => toggleMemberSelection(contact._id)}
                          className="flex items-center gap-3 p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(contact._id)}
                            onChange={() => {}} // handled by div click
                            className="w-5 h-5 accent-lime-500 cursor-pointer"
                          />
                          <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center font-bold text-amber-800 dark:text-amber-100 text-sm">
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
                </div>

                <button
                  type="submit"
                  disabled={isCreating || !groupName.trim()}
                  className="mt-2 w-full bg-slate-800 hover:bg-slate-700 dark:bg-lime-400 dark:hover:bg-lime-300 text-white dark:text-slate-900 font-black text-lg py-3 rounded-xl border-2 border-transparent dark:border-slate-800 shadow-[4px_4px_0_0_rgba(100,116,139,0.5)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(100,116,139,0.5)] dark:hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 mb-1"
                >
                  {isCreating ? "Creating..." : "Create Group"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SideBar;
