"use client";

import { Task, TaskStatus } from "../types";
import {
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  ArrowRightCircle,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      case "Medium":
        return "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
      case "Low":
        return "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
      default:
        return "text-neutral-600 bg-neutral-100 dark:text-neutral-400 dark:bg-neutral-800";
    }
  };

  const isOverdue = new Date(task.date) < new Date() && task.status !== "Done";

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all group relative">
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 text-neutral-400 hover:text-blue-500 rounded bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700/50 dark:hover:bg-neutral-700"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-neutral-400 hover:text-red-500 rounded bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700/50 dark:hover:bg-neutral-700"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3
        className={`font-semibold text-neutral-800 dark:text-neutral-100 mb-1 leading-tight ${task.status === "Done" ? "line-through text-neutral-500 dark:text-neutral-400" : ""}`}
      >
        {task.title}
      </h3>

      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-700/50">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700/50 px-2 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-lime-400"></span>
            {task.category}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-500" : "text-neutral-500 dark:text-neutral-400"}`}
        >
          <Calendar size={12} />
          <span>
            {new Date(task.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Status quick actions */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700 rounded-full px-2 py-1 gap-1">
        {task.status !== "Todo" && (
          <button
            title="Move to Todo"
            onClick={() => onStatusChange("Todo")}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <Circle size={14} />
          </button>
        )}
        {task.status !== "In Progress" && (
          <button
            title="Move to In Progress"
            onClick={() => onStatusChange("In Progress")}
            className="p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          >
            <ArrowRightCircle size={14} />
          </button>
        )}
        {task.status !== "Done" && (
          <button
            title="Mark as Done"
            onClick={() => onStatusChange("Done")}
            className="p-1 text-green-400 hover:text-green-600 dark:hover:text-green-300"
          >
            <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
