"use client";

import { use, useEffect, useState } from "react";
import { FaTimes, FaLock, FaUnlock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getContactsApi,
  getIndividualMessagesApi,
  setSecureChatApi,
  removeSecureChatApi,
} from "@/api/api";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ username: string }>;
}

const IndividualInfoPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username);
  const router = useRouter();
  const { user, token } = useAuth();

  const [contact, setContact] = useState<any>(null);
  const [isSecure, setIsSecure] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      if (!token || !user) return;
      try {
        const contacts = await getContactsApi(token);
        if (contacts) {
          const found = contacts.find((c: any) => c.username === username);
          if (found) {
            setContact(found);
            // Fetch messages once to get the secure chat status
            const msgData = await getIndividualMessagesApi(
              user._id,
              found._id,
              1,
              token,
            );
            if (msgData) {
              setIsSecure(!!msgData.isSecureCurrent);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, [token, user, username]);

  const handleToggleSecureChat = async () => {
    if (isSecure) {
      // Prompt confirm maybe? Or just disable
      if (
        !window.confirm(
          "Are you sure you want to remove the password protection for this chat?",
        )
      )
        return;
      if (!user?._id || !contact?._id || !token) return;

      setIsSubmitting(true);
      const res = await removeSecureChatApi(user._id, contact._id, token);
      if (res) {
        setIsSecure(false);
        // also clear verification flag if disable
        sessionStorage.removeItem(`secure_verified_${contact._id}`);
      }
      setIsSubmitting(false);
    } else {
      setPasswordInput("");
      setShowPasswordModal(true);
    }
  };

  const submitSetPassword = async () => {
    if (!passwordInput.trim()) {
      toast.error("Password cannot be empty");
      return;
    }
    if (!user?._id || !contact?._id || !token) return;

    setIsSubmitting(true);
    const res = await setSecureChatApi(
      user._id,
      contact._id,
      passwordInput,
      token,
    );
    if (res) {
      setIsSecure(true);
      setShowPasswordModal(false);
      // mark it verified for this session so they don't immediately get locked out
      sessionStorage.setItem(`secure_verified_${contact._id}`, "true");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="h-full bg-lime-50 dark:bg-neutral-950 flex flex-col items-center">
      <div className="w-full flex items-center justify-between p-4 border-b border-lime-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-lime-200 dark:bg-neutral-700 flex items-center justify-center mr-4 shrink-0 text-lime-800 dark:text-neutral-300 font-bold text-xl">
            {contact?.avatar ? (
              <img
                src={contact.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : contact?.name ? (
              contact.name.charAt(0).toUpperCase()
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {contact?.name || "Loading..."}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              @{username}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-red-500 hover:scale-110 transition-colors cursor-pointer shrink-0 ml-4"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <div className="w-full max-w-lg mt-8 px-4 flex flex-col gap-4">
        {/* Secure Chat Option */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${isSecure ? "bg-lime-100 dark:bg-lime-900/50 text-lime-600 dark:text-lime-400" : "bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400"}`}
            >
              {isSecure ? <FaLock size={18} /> : <FaUnlock size={18} />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
                Secure Chat
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Require a password to open this chat.
              </p>
            </div>
          </div>

          <button
            disabled={loading || isSubmitting}
            onClick={handleToggleSecureChat}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
              isSecure ? "bg-lime-500" : "bg-slate-300 dark:bg-slate-600"
            } ${loading || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isSecure ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Set Secure Password
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Enter a password to protect this conversation. You will need to
              enter this password to view your messages.
            </p>
            <input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-lime-500 mb-4 text-slate-900 dark:text-white"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitSetPassword}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-lime-500 hover:bg-lime-600 text-white transition-colors"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualInfoPage;
