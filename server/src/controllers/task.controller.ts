import type { Request, Response } from "express";
import { Task } from "../models/task.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { NotificationModel } from "../models/notification.model";

interface AuthRequest extends Request {
  user?: any;
}

export const getTasks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user._id) {
      return res.status(401).json(new ApiError(401, "Unauthorized request"));
    }

    const tasks = await Task.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
  },
);

export const createTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, description, status, priority, date, time, category } =
      req.body;

    if (!title || !date) {
      return res.status(400).json(new ApiError(400, "Title and date are required"));
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || "",
      status: status || "Todo",
      priority: priority || "Medium",
      date,
      time: time || "",
      category: category || "General",
    });

    const notification = await NotificationModel.create({
      user: req.user._id,
      title: "Task created successfully",
      content: `Task "${task.title}" created successfully`,
      task: task._id,
      notificationType: "task",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, task, "Task created successfully"));
  },
);

export const updateTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, user: req.user._id });

    if (!task) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          ...req.body,
        },
      },
      { new: true, runValidators: true },
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
  },
);

export const deleteTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, user: req.user._id });

    if (!task) {
      return res.status(404).json(new ApiError(404, "Task not found"));
    }

    await Task.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Task deleted successfully"));
  },
);
