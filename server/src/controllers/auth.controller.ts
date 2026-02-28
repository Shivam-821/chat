import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UserModel } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { NotificationModel } from "../models/notification.model";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json(new ApiError(409, "User with email or username already exists"));
    }

    const user = await UserModel.create({
      name,
      username,
      email,
      password,
      isVerified: false,
      isOnline: true,
    });

    const notification = await NotificationModel.create({
      user: user._id,
      title: "Welcome to Chat platform",
      content:
        "Thank you for joining our platform. We make sure you have a smooth and secure experience.",
      notificationType: "greeting",
    });

    const token = user.generateToken();

    return res
      .status(201)
      .cookie("token", token, { httpOnly: true, secure: true })
      .json(
        new ApiResponse(
          201,
          {
            user: {
              name: user.name,
              username: user.username,
              email: user.email,
            },
            token,
          },
          "User registered successfully",
        ),
      );
  },
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiError(400, "Email and password are required"));
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  const isPasswordValid = await user.isPasswordValid(password);
  if (!isPasswordValid) {
    return res.status(401).json(new ApiError(401, "Invalid credentials"));
  }

  const token = user.generateToken();

  return res
    .status(200)
    .cookie("token", token, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        200,
        {
          user: { name: user.name, username: user.username, email: user.email },
          token,
        },
        "User logged in successfully",
      ),
    );
});

export const verifyToken = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            user: {
              name: user.name,
              username: user.username,
              email: user.email,
            },
          },
          "Token verified",
        ),
      );
  },
);
