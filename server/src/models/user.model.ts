import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface Iuser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  about?: string;
  isVerified: boolean;
  avatar?: string;
  isOnline: boolean;
  generateToken(): string;
  isPasswordValid(password: string): Promise<boolean>;
}

const userSchema = new Schema<Iuser>(
  {
    name: {
      type: String,
      required: true,
    },
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
    avatar: {
      type: String,
    },
    isOnline: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" },
  );
};

userSchema.methods.isPasswordValid = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const UserModel = mongoose.model<Iuser>("User", userSchema);
