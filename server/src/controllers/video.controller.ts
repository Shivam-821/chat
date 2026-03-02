import { VideoModel } from "../models/video.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { Response } from "express";

export const createVideoCall = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const { roomCode } = req.body;
    if (!roomCode) {
      return res.status(400).json(new ApiError(400, "Room code is required"));
    }

    const videoCall = await VideoModel.create({
        host: user._id,
        roomID: roomCode,
        startedAt: new Date().toISOString(),
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, { videoCall }, "Video call created successfully"),
      );
  },
);
