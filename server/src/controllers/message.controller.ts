import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { MessageModel } from "../models/message.model";
import { IndividualMessageModel } from "../models/individual.model";
import { GroupModel } from "../models/group.model";
import type { AuthRequest } from "../middlewares/auth.middleware";

const PAGE_SIZE = 25;

// ─────────────────────────────────────────────
//  Socket Helper: Save individual message to DB
// ─────────────────────────────────────────────
export const saveIndividualMessage = async (
  senderId: string,
  receiverId: string,
  message: string,
) => {
  // Find the IndividualMessage chat document for this pair
  const chat = await IndividualMessageModel.findOne({
    $or: [
      { user1: senderId, user2: receiverId },
      { user1: receiverId, user2: senderId },
    ],
  });

  if (!chat) return;

  const saved = await MessageModel.create({
    sender: senderId,
    chatId: chat._id,
    chatType: "IndividualMessage",
    message,
    type: "text",
  });

  // Update lastMessage on the chat doc
  await IndividualMessageModel.findByIdAndUpdate(chat._id, {
    lastMessage: saved._id,
  });

  return saved;
};

// ─────────────────────────────────────────────
//  Socket Helper: Save group message to DB
// ─────────────────────────────────────────────
export const saveGroupMessage = async (
  senderId: string,
  groupId: string,
  message: string,
) => {
  const saved = await MessageModel.create({
    sender: senderId,
    chatId: groupId,
    chatType: "Group",
    message,
    type: "text",
  });

  await GroupModel.findByIdAndUpdate(groupId, { lastMessage: saved._id });

  return saved;
};


export const getIndividualMessages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

    const { user1Id, user2Id } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);

    // Find the chat between these two users
    const chat = await IndividualMessageModel.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });

    if (!chat) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { messages: [], hasMore: false },
            "No messages yet",
          ),
        );
    }

    const total = await MessageModel.countDocuments({ chatId: chat._id });

    const messages = await MessageModel.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("sender", "name avatar")
      .lean();

    // Return in ascending order so UI renders oldest → newest
    messages.reverse();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          messages,
          hasMore: page * PAGE_SIZE < total,
          page,
        },
        "Messages fetched",
      ),
    );
  },
);


export const getGroupMessages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

    const { groupId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);

    const total = await MessageModel.countDocuments({
      chatId: groupId,
      chatType: "Group",
    });

    const messages = await MessageModel.find({
      chatId: groupId,
      chatType: "Group",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("sender", "name avatar")
      .lean();

    messages.reverse();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          messages,
          hasMore: page * PAGE_SIZE < total,
          page,
        },
        "Group messages fetched",
      ),
    );
  },
);
