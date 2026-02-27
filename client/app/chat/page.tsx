"use client"

import Link from "next/link";
import { FaUser, FaUsers, FaVideo } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const ChatPage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center grow p-6 overflow-hidden relative">
      <div className="max-w-5xl text-center space-y-12 relative z-10 w-full">
        {/* Cartoonish Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-wider text-black dark:text-white drop-shadow-[4px_4px_0_#facc15] dark:drop-shadow-[4px_4px_0_#10b981] uppercase leading-tight">
          Choose Your <br />
          <span className="text-pink-500 dark:text-emerald-400 block mt-4 text-6xl md:text-8xl transform rotate-2">
            Chat Vibe!
          </span>
        </h1>

        {/* Action Buttons Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center mt-12 w-full max-w-lg mx-auto md:max-w-none">
          {/* Individual Chat */}
          <Link href={isAuthenticated ? "/chat/individual" : "/signin"}>
            <div className="h-full group relative w-full flex flex-col items-center justify-center gap-4 px-8 py-10 text-2xl font-bold bg-yellow-400 dark:bg-rose-500 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer">
              <FaUser className="text-6xl mb-2 group-hover:scale-110 transition-transform" />
              <span>Individual Chat</span>
              <span className="absolute -top-4 -right-4 bg-lime-400 dark:bg-sky-400 text-black dark:text-white text-sm px-4 py-1.5 rounded-full border-2 border-black dark:border-white rotate-12 group-hover:rotate-0 transition-transform">
                1-on-1
              </span>
            </div>
          </Link>

          {/* Group Chat */}
          <Link href={isAuthenticated ? "/chat/group" : "/signin"}>
            <div className="h-full group relative w-full flex flex-col items-center justify-center gap-4 px-8 py-10 text-2xl font-bold bg-cyan-400 dark:bg-cyan-500 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer">
              <FaUsers className="text-6xl mb-2 group-hover:scale-110 transition-transform" />
              <span>Group Chat</span>
              <span className="absolute -top-4 -left-4 bg-orange-400 dark:bg-emerald-400 text-black dark:text-white text-sm px-4 py-1.5 rounded-full border-2 border-black dark:border-white -rotate-12 group-hover:rotate-0 transition-transform">
                Squad!
              </span>
            </div>
          </Link>

          {/* Video Chat */}
          <Link href={isAuthenticated ? "/video" : "/signin"}>
            <div className="h-full group relative w-full flex flex-col items-center justify-center gap-4 px-8 py-10 text-2xl font-bold bg-pink-400 dark:bg-sky-500 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer">
              <FaVideo className="text-6xl mb-2 group-hover:scale-110 transition-transform" />
              <span>Video Chat</span>
              <span className="absolute -bottom-4 right-10 bg-purple-400 dark:bg-rose-400 text-black dark:text-white text-sm px-4 py-1.5 rounded-full border-2 border-black dark:border-white rotate-6 group-hover:-rotate-6 transition-transform">
                Face 2 Face
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
