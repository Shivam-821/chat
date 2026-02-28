"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import TaskModal from "./TaskModal";

import {
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import { Task } from "../types";

// Helper to get days in a month
const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const initialTasks: Task[] = [];

export default function TrackerCalendar() {
  const { token } = useAuth();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // UI State
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today.toISOString().split("T")[0],
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Generate calendar grid array
  const calendarDays = useMemo(() => {
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, dateStr: null, isPast: false });
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayDate = new Date(year, month, d);
      // Set times to midnight for accurate day comparison
      dayDate.setHours(0, 0, 0, 0);
      const todayAtMidnight = new Date();
      todayAtMidnight.setHours(0, 0, 0, 0);

      const isPast = dayDate < todayAtMidnight;
      days.push({ day: d, dateStr, isPast });
    }
    return days;
  }, [year, month, daysInMonth, firstDay]);

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsSidebarOpen(true);
  };

  const handleCreateTask = async (newTask: Omit<Task, "_id">) => {
    if (!token) return;
    const createdTask = await createTaskApi(newTask, token);
    if (createdTask) {
      setTasks([...tasks, createdTask]);
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

  const toggleTaskStatus = async (taskId: string) => {
    if (!token) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const newStatus =
      task.status === "Todo"
        ? "In Progress"
        : task.status === "In Progress"
          ? "Done"
          : "Todo";

    const updatedTask = await updateTaskApi(
      taskId,
      { ...task, status: newStatus },
      token,
    );
    if (updatedTask) {
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
    }
  };

  const selectedTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => (a.time || "24:00").localeCompare(b.time || "24:00"));

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
      {/* Main Calendar Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "md:mr-80 lg:mr-96" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="hidden md:flex text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-100 items-center gap-2">
              <CalendarIcon className="text-lime-500" />
              Tracker
            </h1>
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shadow-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <span className="px-2 md:px-4 text-sm md:text-base font-semibold text-neutral-700 dark:text-neutral-200 min-w-[100px] md:min-w-[140px] text-center">
                {currentDate.toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shadow-sm transition-all"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <button
              onClick={() => {
                setCurrentDate(
                  new Date(today.getFullYear(), today.getMonth(), 1),
                );
                setSelectedDate(today.toISOString().split("T")[0]);
              }}
              className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              Today
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 md:gap-2 bg-lime-500 hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">Add Task</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="grid grid-cols-7 gap-px rounded-t-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-px">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-neutral-100 dark:bg-neutral-900 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                <span className="md:hidden">{day.charAt(0)}</span>
                <span className="hidden md:inline">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            {calendarDays.map((item, i) => {
              if (!item.dateStr) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="bg-neutral-50 dark:bg-neutral-900/40 min-h-[80px] md:min-h-[100px]"
                  />
                );
              }

              const isToday =
                item.dateStr === today.toISOString().split("T")[0];
              const isSelected = item.dateStr === selectedDate;
              const cellTasks = tasks.filter((t) => t.date === item.dateStr);
              const todoCount = cellTasks.filter(
                (t) => t.status === "Todo",
              ).length;
              const inProgressCount = cellTasks.filter(
                (t) => t.status === "In Progress",
              ).length;
              const doneCount = cellTasks.filter(
                (t) => t.status === "Done",
              ).length;

              return (
                <div
                  key={item.dateStr}
                  onClick={() => handleDayClick(item.dateStr!)}
                  className={`
                    min-h-[80px] md:min-h-[120px] p-1 md:p-2 bg-white dark:bg-neutral-900 relative cursor-pointer
                    transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/80 group
                    ${isSelected ? "ring-2 ring-inset ring-lime-500 z-10 bg-lime-50/30 dark:bg-lime-900/10" : ""}
                    ${item.isPast ? "opacity-80" : ""}
                  `}
                >
                  {/* Diagonal Line for past days (crossed out) */}
                  {item.isPast && (
                    <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30 flex items-center justify-center overflow-hidden">
                      <div className="w-[150%] h-px bg-neutral-500 dark:bg-neutral-400 transform -rotate-35"></div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`
                      flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-semibold
                      ${isToday ? "bg-lime-500 text-white shadow-sm" : "text-neutral-700 dark:text-neutral-300 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700"}
                    `}
                    >
                      {item.day}
                    </span>
                  </div>

                  {/* Task Indicators */}
                  <div className="flex flex-row flex-wrap md:flex-col gap-1 mt-1 md:mt-1 z-10 relative">
                    {todoCount > 0 && (
                      <>
                        <div className="hidden md:flex items-center gap-1 text-[10px] md:text-xs text-amber-600 dark:text-amber-400 font-medium truncate bg-amber-50 dark:bg-amber-900/20 px-1 py-0.5 rounded">
                          <Circle size={10} className="shrink-0" />
                          <span className="truncate">{todoCount} Todo</span>
                        </div>
                        <div
                          className="md:hidden w-2 h-2 rounded-full bg-amber-500"
                          title={`${todoCount} Todo`}
                        />
                      </>
                    )}
                    {inProgressCount > 0 && (
                      <>
                        <div className="hidden md:flex items-center gap-1 text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium truncate bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">
                          <Circle size={10} className="shrink-0" />
                          <span className="truncate">
                            {inProgressCount} In Progress
                          </span>
                        </div>
                        <div
                          className="md:hidden w-2 h-2 rounded-full bg-blue-500"
                          title={`${inProgressCount} In Progress`}
                        />
                      </>
                    )}
                    {doneCount > 0 && (
                      <>
                        <div className="hidden md:flex items-center gap-1 text-[10px] md:text-xs text-green-600 dark:text-green-400 font-medium truncate bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">
                          <CheckCircle2 size={10} className="shrink-0" />
                          <span className="truncate">{doneCount} Done</span>
                        </div>
                        <div
                          className="md:hidden w-2 h-2 rounded-full bg-green-500"
                          title={`${doneCount} Done`}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Panel for Selected Day */}
      {isSidebarOpen && selectedDate && (
        <div className="absolute top-0 right-0 h-full w-full md:w-80 lg:w-96 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-20 animate-slide-in-right">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
              {new Date(selectedDate).toLocaleDateString("default", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedTasks.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
                <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium">No tasks for this day</p>
                <p className="text-sm">Click the + button to add one.</p>
              </div>
            ) : (
              selectedTasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-3 rounded-xl border ${task.status === "Done" ? "bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-800 opacity-70" : "bg-white border-lime-200 dark:bg-neutral-800 dark:border-lime-900/30 shadow-sm"} transition-colors relative group`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <button
                      onClick={() => toggleTaskStatus(task._id)}
                      className={`mt-0.5 shrink-0 ${task.status === "Done" ? "text-lime-500" : "text-neutral-400 hover:text-lime-500"}`}
                    >
                      {task.status === "Done" ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold text-sm ${task.status === "Done" ? "line-through text-neutral-500" : "text-neutral-800 dark:text-neutral-200"}`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        {task.time && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                            <Clock size={10} /> {task.time}
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border 
                                     ${
                                       task.priority === "High"
                                         ? "text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                                         : task.priority === "Medium"
                                           ? "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"
                                           : "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800"
                                     }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-neutral-800/90 rounded px-1 flex gap-1 shadow-sm backdrop-blur">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    >
                      <span className="text-[10px] font-bold px-1">EDIT</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <span className="text-[10px] font-bold px-1">DEL</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold hover:bg-black dark:hover:bg-neutral-200 transition-colors"
            >
              <Plus size={18} />
              Add New Task for{" "}
              {new Date(selectedDate).toLocaleDateString("default", {
                month: "short",
                day: "numeric",
              })}
            </button>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          defaultDate={selectedDate || undefined}
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
