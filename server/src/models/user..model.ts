import mongoose, { Document, Schema } from "mongoose";

export interface Iuser extends Document {
  username: string;
  email: string;
  password: string;
  about?: string;
  isVerified: boolean;
  isOnline: boolean;
}

const userSchema = new Schema<Iuser>(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    about: {
      type: String,
    },
    isVerified: {
      type: Boolean,
    },
    isOnline: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);
