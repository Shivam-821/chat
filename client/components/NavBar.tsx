"use client";

import { useState } from "react";
import ThemeButton from "./ThemeButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

const NavBar = () => {
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  return (
    <div className="h-16 bg-lime-100 dark:bg-neutral-900 flex justify-between items-center px-5 sticky top-0 z-50">
      <div>
        <p
          onClick={() => router.push("/")}
          className="cursor-pointer text-3xl md:text-4xl font-black uppercase tracking-widest text-black dark:text-white drop-shadow-[2px_2px_0_#facc15] dark:drop-shadow-[2px_2px_0_#10b981] transform -rotate-2 hover:rotate-0 transition-transform"
        >
          Chat
        </p>
      </div>
      <div className="hidden md:flex items-center justify-between md:gap-10 gap-5">
        <p
          onClick={() => router.push("/")}
          className="cursor-pointer hover:scale-105"
        >
          Home
        </p>

        {!isAuthenticated ? (
          <>
            <p
              onClick={() => router.push("/signin")}
              className="cursor-pointer hover:scale-105 font-bold text-amber-600 dark:text-amber-400"
            >
              Sign In
            </p>
          </>
        ) : (
          <>
            <p
              onClick={() => router.push("/chat")}
              className="cursor-pointer hover:scale-105"
            >
              Chats
            </p>
            <p
              onClick={() => router.push("/tracker")}
              className="cursor-pointer hover:scale-105"
            >
              Tracker
            </p>
          </>
        )}
      </div>
      <div className="relative">
        <div className="relative inline-block">
          {/* Avatar / fallback initial button */}
          <button
            onClick={() => setOpenModal(!openModal)}
            className="w-9 h-9 rounded-full border-2 border-slate-800 dark:border-neutral-600 overflow-hidden flex items-center justify-center bg-lime-200 dark:bg-neutral-700 hover:ring-2 hover:ring-amber-400 transition-all focus:outline-none"
          >
            {isAuthenticated && user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                {isAuthenticated
                  ? (user?.username?.charAt(0).toUpperCase() ?? "?")
                  : "?"}
              </span>
            )}
          </button>
          {isAuthenticated && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white dark:text-rose-50 text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-lime-100 dark:border-neutral-900 pointer-events-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {openModal && (
          <div
            onClick={() => setOpenModal(false)}
            className="absolute w-37 z-50 -right-2 top-8 flex flex-col gap-2 bg-lime-200 dark:bg-neutral-800 py-3 px-6 rounded"
          >
            {isAuthenticated && (
              <>
                <div
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer hover:scale-105 border-b border-lime-300 dark:border-neutral-700 pb-2 mb-1"
                >
                  <span className="font-semibold hover:font-bold">
                    {user?.username || "Profile"}
                  </span>
                </div>
                <div
                  onClick={() => router.push("/notifications")}
                  className="cursor-pointer hover:scale-105 hover:font-semibold mb-1 flex items-center gap-2"
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div
                  onClick={() => router.push("/tracker")}
                  className="md:hidden cursor-pointer hover:scale-105 hover:font-semibold"
                >
                  Tracker
                </div>
              </>
            )}

            <div className="flex items-center gap-2 py-1">
              Theme: <ThemeButton />
            </div>

            {isAuthenticated ? (
              <div
                onClick={logout}
                className="cursor-pointer hover:scale-105 text-rose-600 dark:text-rose-400 font-semibold mt-1 pt-2 border-t border-lime-300 dark:border-neutral-700"
              >
                Sign Out
              </div>
            ) : (
              <div
                onClick={() => router.push("/signin")}
                className="cursor-pointer hover:scale-105 text-amber-600 dark:text-amber-400 font-semibold mt-1 pt-2 border-t border-lime-300 dark:border-neutral-700"
              >
                Sign In
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
