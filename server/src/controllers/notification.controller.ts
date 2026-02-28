import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { NotificationModel } from "../models/notification.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Task } from "../models/task.model";

export const deleteNotification = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const notification_id = req.params.id;
    const user = req.user;

    if (!user || !user._id) {
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      await NotificationModel.deleteMany({
        user: user._id,
        _id: notification_id,
      });
    } catch (error) {
      return res
        .status(500)
        .json(new ApiError(500, "Failed to delete notification"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Notifications deleted successfully"));
  },
);

// this will be sent by us when user vist the page and the tasks are pending and day is about to end(IST). Message will be sent only once and if the user hasn't completeed the task before 3 hrs of the end of the day.
export const sendAlertOfTaskPending = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;

    if (!user || !user._id) {
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const istHours = istTime.getUTCHours();
      // Format as YYYY-MM-DD
      const istDateString = istTime.toISOString().split("T")[0];

      if (istHours < 21) {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "Alert window not yet reached"));
      }

      // Find all tasks for this user due today that are not done
      const pendingTasks = await Task.find({
        user: user._id,
        date: istDateString,
        status: { $in: ["Todo", "In Progress"] },
      });

      if (!pendingTasks || pendingTasks.length === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "No pending tasks for today"));
      }

      // For each pending task, create a notification if one doesn't already exist for it
      let notificationsSent = 0;
      for (const task of pendingTasks) {
        const existingNotification = await NotificationModel.findOne({
          user: user._id,
          task: task._id,
          notificationType: "task",
        });

        if (!existingNotification) {
          await NotificationModel.create({
            user: user._id,
            title: "Task pending",
            content: `Day is about to end, complete your task: ${task.title}`,
            task: task._id,
            notificationType: "task",
          });
          notificationsSent++;
        }
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { sent: notificationsSent },
            `Sent ${notificationsSent} task pending alerts`,
          ),
        );
    } catch (error) {
      return res
        .status(500)
        .json(new ApiError(500, "Failed to send alert of task pending"));
    }
  },
);
