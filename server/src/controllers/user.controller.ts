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

export const getIncomingRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // Find all pending requests where the receiver is the current user
    const requests = await RequestModel.find({
      receiver: user._id,
      status: "pending",
    })
      .populate("sender", "username email avatar")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { requests },
          "Incoming requests fetched successfully",
        ),
      );
  },
);

export const updateRequestStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!["accepted", "rejected"].includes(status)) {
      throw new ApiError(400, "Invalid status. Must be accepted or rejected.");
    }

    const request = await RequestModel.findOne({
      _id: requestId,
      receiver: user._id,
      status: "pending",
    });

    if (!request) {
      throw new ApiError(404, "Pending contact request not found");
    }

    request.status = status;
    await request.save();

    let individualMessage = null;

    if (status === "accepted") {
      // Check if they are already friends (edge case)
      const existingIndividual = await IndividualMessageModel.findOne({
        $or: [
          { user1: request.sender, user2: request.receiver },
          { user1: request.receiver, user2: request.sender },
        ],
      });

      if (!existingIndividual) {
        // Create friendship chat
        individualMessage = await IndividualMessageModel.create({
          user1: request.sender,
          user2: request.receiver,
        });
      }
    }

    // Create a notification for the sender
    await NotificationModel.create({
      user: request.sender,
      title: "Contact Request Update",
      content: `${user.username} has ${status} your request`,
      notificationType: "request",
    });

    await NotificationModel.deleteOne({
      user: request.sender,
      title: "Contact Request Update",
      content: `${user.username} has ${status} your request`,
      notificationType: "request",
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { request, individualMessage },
          `Contact request ${status} successfully`,
        ),
      );
  },
);

export const getContacts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // Find all individuals where the current user is either user1 or user2
    const friendships = await IndividualMessageModel.find({
      $or: [{ user1: user._id }, { user2: user._id }],
    })
      .populate("user1", "name username email avatar isOnline")
      .populate("user2", "name username email avatar isOnline")
      .sort({ updatedAt: -1 });

    // Map the results to just return the other user's profile
    const contacts = friendships.map((chat: any) => {
      // If user1 is the logged-in user, return user2. Otherwise, return user1.
      return chat.user1._id.toString() === user._id.toString()
        ? chat.user2
        : chat.user1;
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { contacts }, "Contacts fetched successfully"),
      );
  },
);
