import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UserModel } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { NotificationModel } from "../models/notification.model";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";

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
      maxlogin: 1,
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
    user.token.push(token);
    await user.save();

    return res
      .status(201)
      .cookie("token", token, { httpOnly: true, secure: true })
      .json(
        new ApiResponse(
          201,
          {
            user: {
              _id: user._id,
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
  user.token.push(token);

  if (user.token.length > 2) {
    user.token.shift();
  }

  user.maxlogin = user.token.length;
  await user.save();

  return res
    .status(200)
    .cookie("token", token, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            avatarPublicId: user.avatarPublicId,
            about: user.about,
          },
          token,
        },
        "User logged in successfully",
      ),
    );
});

export const verifyToken = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user;
    const userToken =
      req.headers.authorization?.split(" ")[1] || req.cookies.token;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    if (userToken && user.token.includes(userToken)) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            user: {
              _id: user._id,
              name: user.name,
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              avatarPublicId: user.avatarPublicId,
              about: user.about,
            },
          },
          "Token verified",
        ),
      );
    }

    return res
      .status(401)
      .clearCookie("token", { httpOnly: true, secure: true })
      .json(new ApiError(401, "Unauthorized"));
  },
);

export const logoutUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user;
    const userToken =
      req.headers.authorization?.split(" ")[1] || req.cookies.token;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    if (userToken) {
      user.token = user.token.filter((t) => t !== userToken);
    }
    user.maxlogin = user.token.length;
    await user.save();

    return res
      .status(200)
      .clearCookie("token", { httpOnly: true, secure: true })
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  },
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

    const { name, about } = req.body;
    const avatarFile = (req as any).file as Express.Multer.File | undefined;

    const dbUser = await UserModel.findById(user._id);
    if (!dbUser)
      return res.status(404).json(new ApiError(404, "User not found"));

    // Update text fields if provided
    if (name?.trim()) dbUser.name = name.trim();
    if (about !== undefined) dbUser.about = about;

    // Handle avatar upload
    if (avatarFile) {
      // Delete old avatar from Cloudinary if exists
      if (dbUser.avatarPublicId) {
        await deleteFromCloudinary(dbUser.avatarPublicId);
      }

      // Upload new avatar to Cloudinary
      const uploadResult = await uploadToCloudinary(avatarFile.path);
      dbUser.avatar = uploadResult.secure_url;
      dbUser.avatarPublicId = uploadResult.public_id;
    }

    await dbUser.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: dbUser._id,
            name: dbUser.name,
            username: dbUser.username,
            email: dbUser.email,
            avatar: dbUser.avatar,
            avatarPublicId: dbUser.avatarPublicId,
            about: dbUser.about,
          },
        },
        "Profile updated successfully",
      ),
    );
  },
);

export const checkUsername = asyncHandler(
  async (req: Request, res: Response) => {
    const username = req.query.username as string;
    if (!username)
      return res.status(400).json(new ApiError(400, "Username is required"));

    const user = await UserModel.findOne({ username });
    if (user)
      return res.status(409).json(new ApiError(409, "Username already exists"));

    return res.status(200).json(new ApiResponse(200, {}, "Username available"));
  },
);
