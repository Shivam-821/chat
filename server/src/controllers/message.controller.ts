import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { MessageModel } from "../models/message.model";
import { IndividualMessageModel } from "../models/individual.model";
import { GroupModel } from "../models/group.model";
import type { AuthRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";
import "../models/poll.model";
import bcrypt from "bcrypt";

const PAGE_SIZE = 25;

// ─────────────────────────────────────────────
//  Socket Helper: Save individual message to DB
// ─────────────────────────────────────────────
export const saveIndividualMessage = async (
  senderId: string,
  receiverId: string,
  message: string,
  replyOn?: string,
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
    replyOn: replyOn ? new mongoose.Types.ObjectId(replyOn) : undefined,
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
  replyOn?: string,
) => {
  const saved = await MessageModel.create({
    sender: senderId,
    chatId: groupId,
    chatType: "Group",
    message,
    type: "text",
    replyOn: replyOn ? new mongoose.Types.ObjectId(replyOn) : undefined,
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
    }).populate({
      path: "pinnedMessage",
      select: "message sender",
      populate: { path: "sender", select: "name" },
    });

    if (!chat) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { messages: [], hasMore: false, pinnedMessage: null },
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
      .populate({
        path: "replyOn",
        select: "message sender",
        populate: { path: "sender", select: "name" },
      })
      .lean();

    // Return in ascending order so UI renders oldest → newest
    messages.reverse();

    // Check if secure chat is enabled for the current user
    const isSecureCurrent =
      chat.secureChat?.some(
        (item) => item.user.toString() === user._id.toString(),
      ) || false;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          messages,
          hasMore: page * PAGE_SIZE < total,
          page,
          pinnedMessage: (chat as any).pinnedMessage ?? null,
          isSecureCurrent,
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

    const group = await GroupModel.findById(groupId)
      .select("pinnedMessage")
      .populate({
        path: "pinnedMessage",
        select: "message sender",
        populate: { path: "sender", select: "name" },
      });

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
      .populate({
        path: "replyOn",
        select: "message sender",
        populate: { path: "sender", select: "name" },
      })
      .populate({
        path: "poll",
        select: "question allowMultiple options",
      })
      .lean();

    messages.reverse();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          messages,
          hasMore: page * PAGE_SIZE < total,
          page,
          pinnedMessage: group?.pinnedMessage ?? null,
        },
        "Group messages fetched",
      ),
    );
  },
);

// secure chat controller
export const setSecureChat = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

    const { user1Id, user2Id, password } = req.body;
    const chat = await IndividualMessageModel.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });

    if (!chat) return res.status(404).json(new ApiError(404, "Chat not found"));

    const bcryptPassword = await bcrypt.hash(password, 10);

    // check if it's already secured
    if (chat.secureChat?.some((item) => item.user.toString() === user1Id)) {
      return res
        .status(400)
        .json(new ApiError(400, "Secure chat already enabled"));
    }

    chat.secureChat?.push({ user: user._id as any, password: bcryptPassword });

    await chat.save();

    return res.status(200).json(new ApiResponse(200, chat, "Secure chat set"));
  },
);

export const verifySecureChat = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

    const { user1Id, user2Id, password } = req.body;
    const chat = await IndividualMessageModel.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });

    if (!chat) return res.status(404).json(new ApiError(404, "Chat not found"));

    let isVerified = false;
    if (chat.secureChat) {
      for (const item of chat.secureChat) {
        if (item.user.toString() === user1Id) {
          isVerified = await bcrypt.compare(password, item.password);
          break;
        }
      }
    }

    if (!isVerified)
      return res.status(401).json(new ApiError(401, "Unauthorized"));

    return res
      .status(200)
      .json(new ApiResponse(200, { isVerified, chat }, "Secure chat verified"));
  },
);

export const removeSecureChat = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

    const { user1Id, user2Id } = req.body;
    const chat = await IndividualMessageModel.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });

    if (!chat) return res.status(404).json(new ApiError(404, "Chat not found"));

    chat.secureChat = chat.secureChat?.filter(
      (item) => item.user.toString() !== user1Id,
    );

    await chat.save();

    return res
      .status(200)
      .json(new ApiResponse(200, chat, "Secure chat removed"));
  },
);
