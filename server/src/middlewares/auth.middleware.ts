import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { UserModel, type Iuser } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: Iuser;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const data = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    if (!data) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const user = await UserModel.findById(data.id);
    if (!user) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }
};