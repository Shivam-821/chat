"use client";

import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaEdit,
  FaCamera,
  FaRegSmile,
} from "react-icons/fa";

const ProfilePage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#f8fafc] dark:bg-neutral-950 p-8 flex justify-center items-center relative overflow-hidden">
      {/* Subtle playful background elements */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-lime-300/20 dark:bg-lime-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-300/20 dark:bg-amber-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

      <div className="w-full max-w-3xl flex flex-col gap-6 relative z-10">
        {/* Main Profile Card (Mix of professional layout and mild cartoonish styling) */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 sm:p-12 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(23,23,23,1)] flex flex-col items-center sm:items-start transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_0_rgba(30,41,59,1)] dark:hover:shadow-[10px_10px_0_0_rgba(23,23,23,1)] duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-8 w-full">
            {/* Playful Avatar */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-lime-100 dark:bg-lime-900/40 rounded-[2rem] rotate-3 border-[3px] border-slate-800 dark:border-neutral-700 flex items-center justify-center shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(23,23,23,1)] overflow-hidden transition-transform group-hover:rotate-6">
                <FaRegSmile
                  size={64}
                  className="text-slate-800 dark:text-neutral-300 -rotate-3 group-hover:-rotate-6 transition-transform"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 bg-amber-400 hover:bg-amber-300 text-slate-900 p-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(30,41,59,1)] hover:scale-105 transition-transform z-10">
                <FaCamera size={16} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                Alex Developer
              </h1>
              <p className="text-slate-600 dark:text-neutral-400 font-bold text-lg mb-6 px-4 py-1.5 bg-slate-100 dark:bg-neutral-700/50 rounded-xl inline-block border-2 border-dashed border-slate-300 dark:border-neutral-600">
                @alexdev_
              </p>

              <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-[4px_4px_0_0_rgba(100,116,139,0.5)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(100,116,139,0.5)] dark:hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] flex items-center gap-2 active:shadow-none active:translate-y-[4px] active:translate-x-[4px]">
                <FaEdit size={16} />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="w-full h-[3px] bg-slate-200 dark:bg-neutral-700 my-10 rounded-full"></div>

          {/* Details Section (Clean and professional but with thick rounded borders) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-sky-50 dark:bg-sky-900/10 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(23,23,23,1)]">
              <div className="w-12 h-12 rounded-xl bg-sky-200 dark:bg-sky-800 border-[3px] border-slate-800 flex items-center justify-center text-slate-800 dark:text-neutral-200 shrink-0 rotate-[-4deg]">
                <FaEnvelope size={20} className="rotate-[4deg]" />
              </div>
              <div className="pt-1">
                <p className="text-xs text-slate-500 dark:text-neutral-500 font-bold uppercase tracking-widest mb-1">
                  Email
                </p>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">
                  alex@example.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(23,23,23,1)]">
              <div className="w-12 h-12 rounded-xl bg-emerald-200 dark:bg-emerald-800 border-[3px] border-slate-800 flex items-center justify-center text-slate-800 dark:text-neutral-200 shrink-0 rotate-[4deg]">
                <FaShieldAlt size={20} className="-rotate-[4deg]" />
              </div>
              <div className="pt-1">
                <p className="text-xs text-slate-500 dark:text-neutral-500 font-bold uppercase tracking-widest mb-1">
                  Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-slate-800"></span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">
                    Verified & Secure
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="w-full mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900/50 border-[3px] border-slate-200 dark:border-neutral-700 border-dashed">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="text-2xl">👋</span> About Me
            </h3>
            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed font-medium text-lg">
              Passionate software developer focusing on modern web technologies.
              Constantly learning and building secure, scalable applications
              with a touch of fun!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
