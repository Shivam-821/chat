"use client";

import React, { useState, useEffect } from "react";
import { Task, TaskStatus, TaskPriority } from "../types";
import { X } from "lucide-react";

interface TaskModalProps {
  task: Task | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (task: Task | Omit<Task, "_id">) => void;
}

export default function TaskModal({
  task,
  defaultDate,
  onClose,
  onSave,
}: TaskModalProps) {
  const [formData, setFormData] = useState<Omit<Task, "_id">>({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    date: defaultDate || new Date().toISOString().split("T")[0], // YYYY-MM-DD
    time: "09:00",
    category: "General",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        date: task.date,
        time: task.time || "09:00",
        category: task.category || "General",
      });
    } else if (defaultDate) {
      setFormData((prev) => ({ ...prev, date: defaultDate }));
    }
  }, [task, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (task) {
      onSave({ ...formData, _id: task._id } as Task);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 ">
      <div className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-between items-center p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none outline-none"
              placeholder="Add more details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm outline-none"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm outline-none"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm outline-none"
                placeholder="e.g. Work"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-lime-500 hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700 rounded-lg transition-colors shadow-sm"
            >
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
