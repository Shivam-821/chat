import React from "react";
import { FaUsers, FaShieldAlt } from "react-icons/fa";

const GroupPage = () => {
  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-between p-8">
      {/* Top spacer */}
      <div className="flex-1"></div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
        <div className="w-24 h-24 bg-amber-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-default">
          <FaUsers size={48} className="text-amber-500 dark:text-amber-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200">
          Group Chat
        </h2>
        <p className="text-center max-w-md font-medium">
          Select a group or create a new space to connect with multiple friends.
        </p>
      </div>

      {/* Bottom encryption notice */}
      <div className="flex-1 flex items-end pb-4">
        <p className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 font-bold">
          <FaShieldAlt size={14} /> Securely encrypted for groups
        </p>
      </div>
    </div>
  );
};

export default GroupPage;
