import { VideoModel } from "../models/video.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { Response } from "express";

// create the video call
export const createInstantVideoCall = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const { roomCode } = req.body;
    if (!roomCode) {
      return res.status(400).json(new ApiError(400, "Room code is required"));
    }

    const existVideoCallWithSameCode = await VideoModel.findOne({
      $and: [{ roomID: roomCode }, { isEnded: false }],
    });
    if (existVideoCallWithSameCode) {
      return res
        .status(400)
        .json(new ApiError(400, "Video With this Room Code already exist"));
    }

    const userInAnotherVideoCall = await VideoModel.findOne({
      $and: [
        { $or: [{ host: user._id }, { guest: user._id }] },
        { isEnded: false },
      ],
    });
    if (userInAnotherVideoCall) {
      return res
        .status(400)
        .json(new ApiError(400, "You already have an active video call"));
    }

    const videoCall = await VideoModel.create({
      host: user._id,
      roomID: roomCode,
      startedAt: new Date(),
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { videoCall }, "Video call created successfully"),
      );
  },
);

// join the video call
export const joinVideoCall = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const { roomCode } = req.body;
    if (!roomCode) {
      return res.status(400).json(new ApiError(400, "Room code is required"));
    }

    const existVideoCall = await VideoModel.findOne({
      $and: [{ roomID: roomCode }, { isEnded: false }],
    });
    if (!existVideoCall) {
      return res.status(404).json(new ApiError(404, "Video call not found"));
    }

    // Check if user is the host reconnecting
    if (existVideoCall.host.toString() === user._id.toString()) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { videoCall: existVideoCall },
            "Host rejoined successfully",
          ),
        );
    }

    // Check if user is the guest reconnecting
    if (existVideoCall.guest) {
      if (existVideoCall.guest.toString() === user._id.toString()) {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { videoCall: existVideoCall },
              "Guest rejoined successfully",
            ),
          );
      }
      return res
        .status(400)
        .json(new ApiError(400, "Video call already joined by another user"));
    }

    const userInAnotherVideoCall = await VideoModel.findOne({
      $and: [
        { $or: [{ host: user._id }, { guest: user._id }] },
        { isEnded: false },
      ],
    });
    if (userInAnotherVideoCall) {
      return res
        .status(400)
        .json(
          new ApiError(400, "You are already in another active video call"),
        );
    }

    existVideoCall.guest = user._id;
    await existVideoCall.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { videoCall: existVideoCall },
          "Video call joined successfully",
        ),
      );
  },
);

// end the video call
export const endVideoCall = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const { roomCode } = req.body;
    if (!roomCode) {
      return res.status(400).json(new ApiError(400, "Room code is required"));
    }

    const existVideoCall = await VideoModel.findOne({
      $and: [{ roomID: roomCode }, { isEnded: false }],
    });
    if (!existVideoCall) {
      return res.status(400).json(new ApiError(400, "Video call not found"));
    }

    if (existVideoCall.host.toString() !== user._id.toString()) {
      return res
        .status(400)
        .json(new ApiError(400, "You are not the host of this video call"));
    }

    existVideoCall.isEnded = true;
    existVideoCall.endedAt = new Date();
    await existVideoCall.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { videoCall: existVideoCall },
          "Video call ended successfully",
        ),
      );
  },
);
