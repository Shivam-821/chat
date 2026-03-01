import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UserKeysModel } from "../models/userKeys.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const backupKeys = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { publicKey, encryptedPrivateKey, iv } = req.body;

    if (!publicKey || !encryptedPrivateKey || !iv) {
      throw new ApiError(400, "Missing required key data");
    }

    let userKeys = await UserKeysModel.findOne({ userId: user._id });

    if (userKeys) {
      userKeys.publicKey = publicKey;
      userKeys.encryptedPrivateKey = encryptedPrivateKey;
      userKeys.iv = iv;
      await userKeys.save();
    } else {
      userKeys = await UserKeysModel.create({
        userId: user._id,
        publicKey,
        encryptedPrivateKey,
        iv,
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { keys: userKeys }, "Keys backed up successfully"),
      );
  },
);

export const getKeys = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  const userKeys = await UserKeysModel.findOne({ userId });

  if (!userKeys) {
    throw new ApiError(404, "Keys not found for this user");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        publicKey: userKeys.publicKey,
        encryptedPrivateKey: userKeys.encryptedPrivateKey,
        iv: userKeys.iv,
      },
      "Keys fetched successfully",
    ),
  );
});
