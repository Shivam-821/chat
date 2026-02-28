import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UserModel } from "../models/user.model";
import { RequestModel } from "../models/request.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { IndividualMessageModel } from "../models/individual.model";
import { NotificationModel } from "../models/notification.model";

export const addContactRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { identifier } = req.body;

    const user = req.user;
    if (!user) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    if (!identifier) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Username or email is required to add a contact"),
        );
    }

    const targetUser = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!targetUser) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    if (targetUser._id.toString() === user._id.toString()) {
      return res
        .status(400)
        .json(
          new ApiError(400, "You cannot send a contact request to yourself"),
        );
    }

    // Check if request already exists
    const existingRequest = await RequestModel.findOne({
      $or: [
        { sender: user._id, receiver: targetUser._id },
        { sender: targetUser._id, receiver: user._id },
      ],
    });

    const existingIndividual = await IndividualMessageModel.findOne({
      $or: [
        { user1: user._id, user2: targetUser._id },
        { user1: targetUser._id, user2: user._id },
      ],
    });

    if (existingIndividual) {
      return res
        .status(400)
        .json(new ApiError(400, "You are already friends with this user"));
    }

    if (existingRequest) {
      return res
        .status(400)
        .json(new ApiError(400, "A request to this user already exists"));
    }

    // Create pending request
    const newRequest = await RequestModel.create({
      sender: user._id,
      receiver: targetUser._id,
      status: "pending",
    });

    const notification = await NotificationModel.create({
      user: targetUser._id,
      title: "New contact request",
      content: `${user.username} sent you a contact request`,
      notificationType: "request",
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { request: newRequest },
          "Contact request sent successfully",
        ),
      );
  },
);
