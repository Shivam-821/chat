"use client";

import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import { Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import {
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from "../../../api/api";

import { Task, TaskStatus, TaskPriority } from "../types";

const initialTasks: Task[] = [];

export default function TrackerBoard() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  const loadTasks = async () => {
    if (!token) return;
    const fetchedTasks = await getTasksApi(token);
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  };

  const handleCreateTask = async (newTask: Omit<Task, "_id">) => {
    if (!token) return;
    const createdTask = await createTaskApi(newTask, token);
    if (createdTask) {
      setTasks([createdTask, ...tasks]);
      setIsModalOpen(false);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!token) return;
    const savedTask = await updateTaskApi(updatedTask._id, updatedTask, token);
    if (savedTask) {
      setTasks(tasks.map((t) => (t._id === savedTask._id ? savedTask : t)));
      setIsModalOpen(false);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;
    const deletedTask = await deleteTaskApi(taskId, token);
    if (deletedTask) {
      setTasks(tasks.filter((t) => t._id !== taskId));
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!token) return;
    const taskToUpdate = tasks.find((t) => t._id === taskId);
    if (!taskToUpdate) return;

    const updatedTask = await updateTaskApi(
      taskId,
      { ...taskToUpdate, status: newStatus },
      token,
    );
    if (updatedTask) {
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
    }
  };

  const openAppModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const columns: { title: TaskStatus; bgColor: string }[] = [
    { title: "Todo", bgColor: "bg-neutral-100 dark:bg-neutral-800" },
    { title: "In Progress", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Done", bgColor: "bg-green-50 dark:bg-green-900/20" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            Tasks
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Manage your daily priorities
          </p>
        </div>
        <button
          onClick={() => openAppModal()}
          className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Board Layout */}
      <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden pb-4">
        {columns.map((column) => (
          <div
            key={column.title}
            className={`flex-1 rounded-xl p-4 flex flex-col min-h-[500px] border border-neutral-200 dark:border-neutral-700/50 ${column.bgColor}`}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-semibold text-neutral-700 dark:text-neutral-300">
                {column.title}
              </h2>
              <span className="bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {tasks.filter((t) => t.status === column.title).length}
              </span>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar flex-1 pb-2">
              {tasks
                .filter((task) => task.status === column.title)
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => openAppModal(task)}
                    onDelete={() => handleDeleteTask(task._id)}
                    onStatusChange={(newStatus) =>
                      handleStatusChange(task._id, newStatus)
                    }
                  />
                ))}
              {tasks.filter((t) => t.status === column.title).length === 0 && (
                <div className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg m-1">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={
            editingTask ? (handleUpdateTask as any) : (handleCreateTask as any)
          }
        />
      )}
    </div>
  );
}
