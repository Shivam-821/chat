"use client";

import React from "react";
import type { PollData } from "@/api/api";

interface PollMessageProps {
  poll: PollData;
  currentUserId: string;
  senderName: string;
  onVote: (optionIndex: number) => void;
}

const PollMessage = ({
  poll,
  currentUserId,
  senderName,
  onVote,
}: PollMessageProps) => {
  const totalVoters = new Set(poll.options.flatMap((o) => o.votes)).size;

  return (
    <div className="w-72 rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-sm">
      {/* Header */}
      <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 dark:border-neutral-700 bg-amber-50 dark:bg-neutral-900/60">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">📊</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Poll · {poll.allowMultiple ? "Multiple choice" : "Single choice"}
          </span>
        </div>
        <p className="font-semibold text-sm leading-snug text-slate-800 dark:text-slate-100">
          {poll.question}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          by {senderName}
        </p>
      </div>

      {/* Options */}
      <div className="px-4 py-3 flex flex-col gap-2 bg-white dark:bg-neutral-800">
        {poll.options.map((option, idx) => {
          const hasVoted = option.votes.includes(currentUserId);
          const count = option.votes.length;
          const pct =
            totalVoters === 0 ? 0 : Math.round((count / totalVoters) * 100);

          return (
            <button
              key={idx}
              onClick={() => onVote(idx)}
              className={`w-full text-left rounded-xl overflow-hidden border-2 transition-all relative group ${
                hasVoted
                  ? "border-amber-400 dark:border-amber-500"
                  : "border-slate-200 dark:border-neutral-600 hover:border-amber-300 dark:hover:border-amber-700"
              }`}
            >
              {/* Progress bar fill */}
              <div
                className={`absolute inset-0 transition-all duration-500 rounded-xl ${
                  hasVoted
                    ? "bg-amber-100 dark:bg-amber-900/40"
                    : "bg-slate-50 dark:bg-neutral-700/40"
                }`}
                style={{ width: `${pct}%` }}
              />
              {/* Row content */}
              <div className="relative flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Radio/check indicator */}
                  <span
                    className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      hasVoted
                        ? "border-amber-500 bg-amber-500 dark:border-amber-400 dark:bg-amber-400"
                        : "border-slate-300 dark:border-neutral-500"
                    }`}
                  >
                    {hasVoted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                    {option.text}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-slate-400 dark:text-slate-500 ml-2">
                  {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-neutral-800">
        {totalVoters} vote{totalVoters !== 1 ? "s" : ""} so far
      </div>
    </div>
  );
};

export default PollMessage;
