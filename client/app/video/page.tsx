"use client";

import { generateRoomCode } from "@/utils/generateRoomCode";
import { useState, useEffect } from "react";
import {
  FaVideo,
  FaCalendarPlus,
  FaKeyboard,
  FaClock,
  FaCalendarDay,
  FaHistory,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createVideoCallApi, getCallHistoryApi } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface CallHistory {
  _id: string;
  host: { _id: string; name: string; avatar?: string };
  guest?: { _id: string; name: string; avatar?: string };
  roomID: string;
  startedAt: string;
  endedAt?: string;
  isEnded: boolean;
}

const VideoPage = () => {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [startMetting, setStartMetting] = useState(false);
  const [scheduleMeeting, setScheduleMeeting] = useState(false);
  const [joinMeeting, setJoinMeeting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const router = useRouter();
  const { token, user } = useAuth();

  const d = new Date();
  const todayDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const currentTimeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (token) fetchCallHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Prevent background scrolling when a modal is open
  useEffect(() => {
    if (startMetting || scheduleMeeting || joinMeeting) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup to ensure scrolling is restored
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [startMetting, scheduleMeeting, joinMeeting]);

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

  const fetchCallHistory = async () => {
    const res = await getCallHistoryApi(token!);
    if (res) {
      setCallHistory(res);
    }
  };

  const handleInstantMeeting = () => {
    setStartMetting(true);
    setRoomCode(generateRoomCode());
  };

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

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 py-1">
            {callHistory.length === 0 && (
              <p className="text-center text-neutral-500 dark:text-neutral-400 font-medium py-6">
                No call history yet
              </p>
            )}
            {callHistory.map((item) => {
              // Show the other participant's name
              const otherUser =
                item.host._id === user?._id ? item.guest : item.host;
              const otherName = otherUser?.name ?? "Unknown";

              // Format duration as m:ss or "Ongoing"
              let duration = "Ongoing";
              if (item.endedAt) {
                const secs = Math.floor(
                  (new Date(item.endedAt).getTime() -
                    new Date(item.startedAt).getTime()) /
                    1000,
                );
                const m = Math.floor(secs / 60);
                const s = secs % 60;
                duration = `${m}m ${s}s`;
              }

              return (
                <div
                  key={item._id}
                  className="bg-pink-100 dark:bg-neutral-700 p-4 border-4 border-black dark:border-white rounded-2xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] flex justify-between items-center hover:-translate-y-1 transition-transform cursor-default group"
                >
                  <div>
                    <h4 className="font-black text-xl text-black dark:text-white group-hover:text-pink-600 dark:group-hover:text-emerald-400 transition-colors">
                      {otherName}
                    </h4>
                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mt-1">
                      {new Date(item.startedAt).toLocaleString("en-US", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {item.isEnded ? (
                    <div className="bg-lime-300 dark:bg-teal-500 px-3 py-1.5 rounded-xl border-2 border-black dark:border-white font-black text-sm text-black dark:text-white flex text-center items-center justify-center shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] min-w-[70px]">
                      {duration}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/video/${item.roomID}`);
                      }}
                      className="cursor-pointer bg-pink-400 dark:bg-rose-500 hover:scale-105 active:scale-95 transition-all px-4 py-1.5 rounded-xl border-2 border-black dark:border-white font-black text-sm text-black dark:text-white flex text-center items-center justify-center shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] min-w-[70px]"
                    >
                      Resume
                    </button>
                  )}
                </div>
              );
            })}
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
          <div
            // onClick={() => setScheduleMeeting(true)}
            className="md:col-span-2 group relative w-full flex flex-col md:flex-row items-center justify-center gap-6 px-10 py-12 bg-cyan-400 dark:bg-sky-500 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer"
          >
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
              {/* Calendar! */}
              Coming Soon!
            </span>
          </div>

          {/* Join Meeting */}
          <div
            onClick={() => setJoinMeeting(true)}
            className="group relative w-full flex flex-col items-center justify-center gap-4 px-8 py-10 bg-yellow-400 dark:bg-emerald-500 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer rotate-1 hover:rotate-0"
          >
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
          <div
            onClick={() => handleInstantMeeting()}
            className="group relative w-full flex flex-col items-center justify-center gap-4 px-8 py-10 bg-pink-400 dark:bg-rose-600 text-black dark:text-white border-4 border-black dark:border-white rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] cursor-pointer -rotate-1 hover:rotate-0"
          >
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

      {startMetting && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-pink-200/50 dark:bg-rose-900/50 flex items-center justify-center backdrop-blur-sm z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 border-4 border-black dark:border-white p-8 rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] max-w-md w-full relative transform rotate-1">
            <button
              onClick={() => setStartMetting(false)}
              className="absolute -top-4 -right-4 bg-red-400 text-black border-4 border-black dark:border-white rounded-full w-10 h-10 flex items-center justify-center font-black text-xl hover:scale-110 hover:-rotate-12 transition-transform shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
            >
              X
            </button>
            <h2 className="text-4xl font-black text-black dark:text-white mb-6 tracking-wide drop-shadow-[2px_2px_0_#f472b6] dark:drop-shadow-[2px_2px_0_#e11d48]">
              Instant Connect
            </h2>
            <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300 mb-6">
              Ready to jump right in? We'll generate a secure room for you
              instantly.
            </p>
            <div className="space-y-3 mb-10">
              <label
                htmlFor="roomCode"
                className="block text-sm font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-100 ml-1"
              >
                Share this code with your friend
              </label>
              <div className="relative group">
                <input
                  id="roomCode"
                  type="text"
                  readOnly
                  value={roomCode}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border-4 border-black dark:border-white p-5 pr-20 font-mono text-3xl font-black rounded-2xl shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] focus:outline-none"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(roomCode)}
                  className="absolute right-3 top-4 bg-lime-300 dark:bg-teal-500 border-4 border-black dark:border-white rounded-xl px-4 py-2 font-black text-sm text-black dark:text-white hover:bg-lime-400 dark:hover:bg-teal-600 hover:scale-105 transition-all shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={async () => {
                setStartMetting(false);
                const res = await createVideoCallApi(token!, roomCode);
                if (res.statusCode === 201) {
                  router.push(`/video/${roomCode}`);
                } else {
                  toast.error("Failed to create video call");
                }
              }}
              className="w-full bg-pink-400 dark:bg-rose-600 text-black dark:text-white font-black text-2xl py-4 border-4 border-black dark:border-white rounded-2xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
            >
              Go Live Now!
            </button>
          </div>
        </div>
      )}
      {scheduleMeeting && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-cyan-200/50 dark:bg-sky-900/50 flex items-center justify-center backdrop-blur-sm z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 border-4 border-black dark:border-white p-8 rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] max-w-md w-full relative transform -rotate-1">
            <button
              onClick={() => setScheduleMeeting(false)}
              className="absolute -top-4 -right-4 bg-red-400 text-black border-4 border-black dark:border-white rounded-full w-10 h-10 flex items-center justify-center font-black text-xl hover:scale-110 hover:-rotate-12 transition-transform shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
            >
              X
            </button>
            <h2 className="text-4xl font-black text-black dark:text-white mb-6 tracking-wide drop-shadow-[2px_2px_0_#22d3ee] dark:drop-shadow-[2px_2px_0_#0ea5e9]">
              Schedule Connect
            </h2>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Meeting Title"
                className="w-full bg-cyan-100 dark:bg-neutral-700 text-black dark:text-white font-bold text-lg p-3 border-4 border-black dark:border-white rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-400 shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)] placeholder:text-neutral-500"
              />
              <div className="flex gap-4">
                <input
                  type="date"
                  min={todayDateStr}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-1/2 bg-cyan-100 dark:bg-neutral-700 text-black dark:text-white font-bold text-md p-3 border-4 border-black dark:border-white rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-400 shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]"
                />
                <input
                  type="time"
                  min={
                    scheduledDate === todayDateStr ? currentTimeStr : undefined
                  }
                  className="w-1/2 bg-cyan-100 dark:bg-neutral-700 text-black dark:text-white font-bold text-md p-3 border-4 border-black dark:border-white rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-400 shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]"
                />
              </div>
            </div>
            <button
              onClick={() => setScheduleMeeting(false)}
              className="w-full bg-cyan-400 dark:bg-sky-500 text-black dark:text-white font-black text-2xl py-4 border-4 border-black dark:border-white rounded-2xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
            >
              Add to Calendar
            </button>
          </div>
        </div>
      )}
      {joinMeeting && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-lime-200/50 dark:bg-emerald-900/50 flex items-center justify-center backdrop-blur-sm z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 border-4 border-black dark:border-white p-8 rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] max-w-md w-full relative transform rotate-1">
            <button
              onClick={() => setJoinMeeting(false)}
              className="absolute -top-4 -right-4 bg-red-400 text-black border-4 border-black dark:border-white rounded-full w-10 h-10 flex items-center justify-center font-black text-xl hover:scale-110 hover:-rotate-12 transition-transform shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
            >
              X
            </button>
            <h2 className="text-4xl font-black text-black dark:text-white mb-6 tracking-wide drop-shadow-[2px_2px_0_#facc15] dark:drop-shadow-[2px_2px_0_#10b981]">
              Join Connect
            </h2>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Paste Meeting ID or Link"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value)}
                className="w-full bg-yellow-100 dark:bg-neutral-700 text-black dark:text-white font-bold text-lg p-4 border-4 border-black dark:border-white rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 dark:focus:ring-emerald-500 shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)] placeholder:text-neutral-500"
              />
            </div>
            <button
              onClick={() => {
                if (!joinRoomCode.trim()) {
                  toast.error("Please enter a valid room code or link");
                  return;
                }
                setJoinMeeting(false);
                // Extract just the room code if a full URL was pasted
                const parts = joinRoomCode.split("/");
                const finalCode = parts[parts.length - 1].trim();
                router.push(`/video/${finalCode}`);
              }}
              className="w-full bg-yellow-400 dark:bg-emerald-500 text-black dark:text-white font-black text-2xl py-4 border-4 border-black dark:border-white rounded-2xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
            >
              Enter Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
