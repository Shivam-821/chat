"use client";

import { useEffect, useRef } from "react";
import { useAudioCall } from "@/context/AudioCallContext";
import { FaPhone, FaVolumeMute, FaVolumeOff, FaVolumeUp } from "react-icons/fa";
import { FaPhoneFlip } from "react-icons/fa6";

const CallNotification = () => {
  const { isReceivingCall, callerName, acceptCall, rejectCall } =
    useAudioCall();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio object once on mount
  useEffect(() => {
    audioRef.current = new Audio("/ringtone.mp3");
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (isReceivingCall && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.log("Audio autoplay prevented:", err));
    } else if (!isReceivingCall && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isReceivingCall]);

  const handleAccept = () => {
    if (audioRef.current) audioRef.current.pause();
    acceptCall();
  };

  const handleReject = () => {
    if (audioRef.current) audioRef.current.pause();
    rejectCall();
  };

  // Only show the notification if someone is calling
  if (!isReceivingCall) return null;

  return (
    <div className="fixed top-5 right-5  backdrop-blur-xl border border-gray-200 dark:border-zinc-800 shadow-2xl px-5 py-4 rounded-md z-9999 min-w-[280px]">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-500 w-12 h-12 rounded-full animate-pulse shrink-0">
          <FaPhone size={20} className="rotate-100" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Incoming Call
          </h3>
          <p className="text-[13px] text-gray-500 dark:text-gray-300 mt-0.5">
            {callerName ? `From: ${callerName}` : "Unknown Caller"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-5">
        <button
          onClick={handleReject}
          className="flex items-center justify-center bg-red-500 hover:bg-red-600 outline-none text-white rounded-full w-12 h-12 transition-transform hover:scale-105 shadow-lg shadow-red-500/30"
          title="Decline"
        >
          <FaPhoneFlip className="-rotate-135" size={20} />
        </button>
        <button
          onClick={handleAccept}
          className="flex items-center justify-center bg-green-500 hover:bg-green-600 outline-none text-white rounded-full w-12 h-12 transition-transform hover:scale-105 shadow-lg shadow-green-500/30"
          title="Accept"
        >
          <FaPhone size={20} className="rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default CallNotification;
