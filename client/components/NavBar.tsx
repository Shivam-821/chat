"use client";

import { useState } from "react";
import ThemeButton from "./ThemeButton";
import { AiFillSetting } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NavBar = () => {
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
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

        {!isAuthenticated && (
          <>
            <p
              onClick={() => router.push("/signin")}
              className="cursor-pointer hover:scale-105 font-bold text-amber-600 dark:text-amber-400"
            >
              Sign In
            </p>
          </>
        )}
      </div>
      <div className="relative">
        <AiFillSetting
          size={20}
          className="hover:rotate-45 transition-all duration-300 cursor-pointer"
          onClick={() => setOpenModal(!openModal)}
        />
        {openModal && (
          <div
            onClick={() => setOpenModal(false)}
            className="absolute w-37 z-50 -right-2 top-8 flex flex-col gap-2 bg-lime-200 dark:bg-neutral-800 py-3 px-6 rounded"
          >
            {isAuthenticated && (
              <>
                <div
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer hover:scale-104 border-b border-lime-300 dark:border-neutral-700 pb-2 mb-1"
                >
                  <span className="font-bold">
                    {user?.username || "Profile"}
                  </span>
                </div>
                <div
                  onClick={() => router.push("/notifications")}
                  className="cursor-pointer hover:scale-104"
                >
                  Notifications
                </div>
              </>
            )}

            <div className="flex items-center gap-2 cursor-pointer hover:scale-104 py-1">
              Theme: <ThemeButton />
            </div>

            {isAuthenticated ? (
              <div
                onClick={logout}
                className="cursor-pointer hover:scale-104 text-rose-600 dark:text-rose-400 font-bold mt-1 pt-2 border-t border-lime-300 dark:border-neutral-700"
              >
                Sign Out
              </div>
            ) : (
              <div
                onClick={() => router.push("/signin")}
                className="cursor-pointer hover:scale-104 text-amber-600 dark:text-amber-400 font-bold mt-1 pt-2 border-t border-lime-300 dark:border-neutral-700"
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
