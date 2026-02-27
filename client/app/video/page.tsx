"use client";

import React, { useState, useEffect } from "react";
import {
  FaVideo,
  FaCalendarPlus,
  FaKeyboard,
  FaClock,
  FaCalendarDay,
  FaHistory,
} from "react-icons/fa";

const VideoPage = () => {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istTime = mounted
    ? time.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "00:00 AM";

  const istDate = mounted
    ? time.toLocaleDateString("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Loading...";

  const history = [
    {
      id: 1,
      name: "Rahul Singh",
      duration: "45 mins",
      datetime: "Oct 24, 10:00 AM",
    },
    {
      id: 2,
      name: "Project Sync",
      duration: "1 hr 20 mins",
      datetime: "Oct 23, 02:30 PM",
    },
    {
      id: 3,
      name: "Amit Kumar",
      duration: "15 mins",
      datetime: "Oct 22, 11:15 AM",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-6 md:p-8 flex flex-col lg:flex-row gap-10">
      {/* Left Column: Clock, Calendar & History */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        {/* Clock & Calendar Block */}
        <div className="bg-yellow-300 dark:bg-emerald-500 p-8 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center gap-4 mb-6">
            <FaClock size={40} className="text-black dark:text-white" />
            <h2 className="text-4xl lg:text-5xl font-black text-black dark:text-white uppercase drop-shadow-[2px_2px_0_#fff] dark:drop-shadow-[2px_2px_0_#000] tracking-wider">
              {istTime}
            </h2>
          </div>
          <div className="flex flex-col gap-2 bg-white/70 dark:bg-black/30 p-5 border-2 border-black dark:border-white rounded-2xl transform rotate-1">
            <div className="flex items-center gap-3">
              <FaCalendarDay
                size={24}
                className="text-black dark:text-white min-w-max"
              />
              <p className="text-xl md:text-2xl font-bold text-black dark:text-white">
                {istDate}
              </p>
            </div>
            <p className="font-semibold text-black/60 dark:text-white/60 ml-9">
              (IST Timezone)
            </p>
          </div>
        </div>

        {/* Video History Block */}
        <div className="bg-white dark:bg-neutral-800 p-6 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] grow flex flex-col relative z-0">
          <div className="absolute top-0 right-8 -mt-5 bg-orange-400 dark:bg-sky-500 border-4 border-black dark:border-white px-4 py-1 rounded-full shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] -rotate-2">
            <span className="font-black text-black dark:text-white text-sm tracking-wider">
              LATEST
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6 mt-2">
            <FaHistory size={28} className="text-black dark:text-white" />
            <h3 className="text-3xl font-black text-black dark:text-white uppercase tracking-wide">
              History
            </h3>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-pink-100 dark:bg-neutral-700 p-4 border-4 border-black dark:border-white rounded-2xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] flex justify-between items-center hover:-translate-y-1 transition-transform cursor-default group"
              >
                <div>
                  <h4 className="font-black text-xl text-black dark:text-white group-hover:text-pink-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mt-1">
                    {item.datetime}
                  </p>
                </div>
                <div className="bg-lime-300 dark:bg-teal-500 px-3 py-1.5 rounded-xl border-2 border-black dark:border-white font-black text-sm text-black dark:text-white flex text-center items-center justify-center shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] min-w-[70px]">
                  {item.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Actions */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* Title */}
        <div className="text-center lg:text-right mt-4 lg:mt-0">
          <h1 className="text-6xl md:text-8xl font-black tracking-wider text-black dark:text-white drop-shadow-[5px_5px_0_#facc15] dark:drop-shadow-[5px_5px_0_#10b981] uppercase leading-tight">
            Connect <br />
            <span className="text-cyan-500 dark:text-emerald-400 block mt-2 transform rotate-1 text-5xl md:text-7xl">
              Face 2 Face!
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-4">
          {/* Schedule Meeting */}
          <div className="md:col-span-2 group relative w-full flex flex-col md:flex-row items-center justify-center gap-6 px-10 py-12 bg-cyan-400 dark:bg-sky-500 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer">
            <FaCalendarPlus className="text-6xl md:text-7xl group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-4xl font-black uppercase tracking-wider">
                Schedule
              </span>
              <span className="text-xl font-bold bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg border-2 border-black dark:border-white mt-2">
                Plan a future meeting
              </span>
            </div>
            <span className="absolute bottom-6 right-8 bg-pink-400 dark:bg-rose-500 text-black dark:text-white text-md px-4 py-2 font-bold rounded-full border-2 border-black dark:border-white rotate-6 group-hover:-rotate-6 transition-transform shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] hidden sm:block">
              Calendar!
            </span>
          </div>

          {/* Join Meeting */}
          <div className="group relative w-full flex flex-col items-center justify-center gap-4 px-8 py-10 bg-yellow-400 dark:bg-emerald-500 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer rotate-1 hover:rotate-0">
            <FaKeyboard className="text-6xl mb-2 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
            <span className="text-3xl font-black uppercase tracking-wider text-center">
              Join
            </span>
            <span className="text-lg font-bold bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg border-2 border-black dark:border-white text-center">
              Use a code/link
            </span>
            <span className="absolute -top-4 -left-4 bg-lime-400 dark:bg-teal-500 text-black dark:text-white text-md px-4 py-2 font-bold rounded-full border-2 border-black dark:border-white -rotate-12 group-hover:rotate-0 transition-transform shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
              Enter Room
            </span>
          </div>

          {/* Instant Meeting */}
          <div className="group relative w-full flex flex-col items-center justify-center gap-4 px-8 py-10 bg-pink-400 dark:bg-rose-600 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer -rotate-1 hover:rotate-0">
            <FaVideo className="text-6xl mb-2 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            <span className="text-3xl font-black uppercase tracking-wider text-center">
              Instant
            </span>
            <span className="text-lg font-bold bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg border-2 border-black dark:border-white text-center">
              Start right now
            </span>
            <span className="absolute -top-4 -right-4 bg-orange-400 dark:bg-sky-500 text-black dark:text-white text-md px-4 py-2 font-bold rounded-full border-2 border-black dark:border-white rotate-12 group-hover:rotate-0 transition-transform shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
              Go Live!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
