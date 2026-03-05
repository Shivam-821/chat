"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdCallEnd } from "react-icons/md";
import { BsMicMuteFill, BsMic } from "react-icons/bs";
import { useAudioCall } from "@/context/AudioCallContext";

const AudioCallBox = () => {
  const {
    isCallActive,
    isMuted,
    toggleMute,
    endCall,
    remoteStream,
    callerName,
  } = useAudioCall();

  const [position, setPosition] = useState({ x: 100, y: 100 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 100, y: 100 });
  const draggableRef = useRef<HTMLDivElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Auto-play the remote stream when it arrives
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current
        .play()
        .catch((err) => console.log("Remote audio play prevented:", err));
    }
  }, [remoteStream]);

  // To keep it simple globally, we'll use the window/document body as the container bounds
  // We initialize the position to sit near the bottom right on mount
  useEffect(() => {
    const initPosition = () => {
      if (draggableRef.current) {
        const rect = draggableRef.current.getBoundingClientRect();
        // Default margin from right and bottom (e.g., 24px)
        const marginX = 24;
        const marginY = 24;

        // Calculate initial x,y so it sits at bottom right relative to top-left of screen
        const initialX = window.innerWidth - rect.width - marginX;
        const initialY = window.innerHeight - rect.height - marginY;

        setPosition({ x: Math.max(0, initialX), y: Math.max(0, initialY) });
      }
    };

    // Slight delay to ensure layout is computed
    const timeoutId = setTimeout(initPosition, 100);

    // Handle window resize to keep it in bounds
    const handleResize = () => {
      if (!draggableRef.current) return;
      const rect = draggableRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        if (newX > maxX) newX = maxX;
        if (newY > maxY) newY = maxY;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        return { x: newX, y: newY };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent dragging if the user interacts with the end call button
    if ((e.target as HTMLElement).closest(".no-drag")) return;

    isDragging.current = true;
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !draggableRef.current) return;

    let newX = e.clientX - startPos.current.x;
    let newY = e.clientY - startPos.current.y;

    const draggableRect = draggableRef.current.getBoundingClientRect();

    // Bounds checking against the window/viewport
    const maxX = window.innerWidth - draggableRect.width;
    const maxY = window.innerHeight - draggableRect.height;

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > maxX) newX = maxX;
    if (newY > maxY) newY = maxY;

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!isCallActive) return null;

  return (
    <>
      <style>{`
        @keyframes audio-wave {
          0%, 100% { height: 10px; opacity: 0.4; }
          50% { height: 36px; opacity: 1; }
        }
        .wave-bar {
          width: 5px;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 9999px;
          animation: audio-wave 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Draggable container wrapper fixed to top-left of DOM, then moved via transform */}
      <div
        ref={draggableRef}
        className="w-[300px] h-[180px] rounded-xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.2)] fixed z-9999 overflow-hidden bg-white/40 backdrop-blur-xl transition-transform duration-75 cursor-grab active:cursor-grabbing touch-none select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          top: 0,
          left: 0,
          margin: 0,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Top Section - Avatars & Waveform */}
        <div className="relative flex items-center justify-between px-8 w-full h-[65%] bg-linear-to-r from-amber-300 via-lime-200 to-amber-300 dark:from-slate-900 dark:via-zinc-900 dark:to-neutral-900 pointer-events-none select-none">
          {/* Caller 1 (Self) */}
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-lime-200 border-2 border-white z-10 shadow-lg flex items-center justify-center text-lg font-bold text-lime-800">
              Me
            </div>
          </div>

          {/* Audio Waveform Signal */}
          <div className="flex items-center justify-center gap-[5px] h-12 z-10 w-24">
            <div
              className="wave-bar shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ animationDelay: "0.0s" }}
            ></div>
            <div
              className="wave-bar shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ animationDelay: "0.15s" }}
            ></div>
            <div
              className="wave-bar shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ animationDelay: "0.3s" }}
            ></div>
            <div
              className="wave-bar shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ animationDelay: "0.45s" }}
            ></div>
            <div
              className="wave-bar shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="wave-bar shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ animationDelay: "0.05s" }}
            ></div>
          </div>

          {/* Caller 2 (Remote) */}
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-amber-200 border-2 border-white z-10 shadow-lg flex items-center justify-center text-lg font-bold text-amber-800">
              {callerName ? callerName.charAt(0).toUpperCase() : "?"}
            </div>
          </div>
        </div>

        {/* Bottom Section - Controls */}
        <div className="w-full h-[35%] bg-linear-to-b from-yellow-100 to-yellow-200 dark:from-zinc-800 dark:to-black flex items-center justify-center relative">
          {/* Subtle glow effect behind button */}
          <div className="absolute bg-[#fc0f1b]/10 w-20 h-20 rounded-full blur-xl pointer-events-none"></div>
          {isMuted ? (
            <BsMicMuteFill
              onClick={toggleMute}
              className="absolute top-3.5 left-8 bg-[#333338] hover:bg-zinc-600 cursor-pointer w-8.5 h-8.5 p-2 rounded-full text-red-400 no-drag z-10"
            />
          ) : (
            <BsMic
              onClick={toggleMute}
              className="absolute top-3.5 left-8 bg-[#333338] hover:bg-zinc-600 cursor-pointer w-8.5 h-8.5 p-2 rounded-full text-green-400 animate-pulse no-drag z-10"
            />
          )}
          <div
            className="group relative cursor-pointer flex items-center justify-center z-10 no-drag"
            onClick={endCall}
          >
            <MdCallEnd className="text-2xl text-white bg-[#fc0f1b] group-hover:bg-red-600 rounded-full p-2.5 w-12 h-12 transform group-hover:scale-105 group-hover:rotate-8 transition-all duration-300 shadow-[0_0_20px_rgba(252,15,27,0.4)] group-hover:shadow-[0_0_25px_rgba(252,15,27,0.7)]" />
          </div>
        </div>
      </div>

      {/* Hidden audio element to play remote stream */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </>
  );
};

export default AudioCallBox;
