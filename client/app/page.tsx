import React from "react";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center grow p-6 overflow-hidden relative">
      <div className="max-w-4xl text-center space-y-12 relative z-10 w-full">
        {/* Cartoonish Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-wider text-black dark:text-white drop-shadow-[5px_5px_0_#facc15] dark:drop-shadow-[5px_5px_0_#10b981] uppercase leading-tight">
          Say Hello To <br />
          <span className="text-yellow-500 dark:text-emerald-400 block mt-4 text-7xl md:text-9xl transform -rotate-2">
            Chat!
          </span>
        </h1>

        {/* Description Card */}
        <div className="mx-auto max-w-2xl bg-white dark:bg-neutral-800 p-8 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transform lg:-rotate-2 hover:rotate-0 transition-transform duration-300">
          <p className="text-2xl md:text-3xl font-bold text-black dark:text-neutral-100 leading-snug">
            The most fun, secure, and cartoonishly awesome place to hang out
            online!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center mt-12 w-full max-w-lg mx-auto sm:max-w-none">
          <Link href="/chat/individual">
            <button className="group relative w-full sm:w-auto px-8 py-4 text-2xl font-bold bg-yellow-400 dark:bg-rose-500 text-black dark:text-white border-4 border-black dark:border-white rounded-2xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none">
              Direct Chat
              <span className="absolute -top-4 -right-4 bg-lime-400 dark:bg-sky-400 text-black dark:text-white text-sm px-3 py-1 rounded-full border-2 border-black dark:border-white rotate-12 group-hover:rotate-0 transition-transform">
                Private!
              </span>
            </button>
          </Link>
          <Link href="/chat">
            <button className="w-full sm:w-auto px-8 py-4 text-2xl font-bold bg-cyan-400 dark:bg-cyan-500 text-black dark:text-white border-4 border-black dark:border-white rounded-2xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none">
              Discover Chat
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
