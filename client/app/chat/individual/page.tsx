import React from "react";
import { FaUser, FaLock } from "react-icons/fa";

const IndiviualPage = () => {
  return (
    <div className="h-[calc(100vh-56px)] w-full flex flex-col items-center justify-between p-8 overflow-none">
      {/* Top spacer */}
      <div className="flex-1"></div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
        <div className="w-24 h-24 bg-lime-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-default">
          <FaUser size={48} className="text-lime-600 dark:text-lime-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200">
          Individual Chat
        </h2>
        <p className="text-center max-w-md font-medium">
          Select a friend from the sidebar to start a direct message.
        </p>
      </div>

      {/* Bottom encryption notice */}
      <div className="flex-1 flex items-end pb-4">
        <p className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 font-bold">
          <FaLock size={12} /> End-to-end encrypted
        </p>
      </div>
    </div>
  );
};

export default IndiviualPage;
