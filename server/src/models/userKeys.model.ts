import mongoose, { Document, Schema } from "mongoose";

export interface IuserKeys extends Document {
  userId: mongoose.Types.ObjectId;
  publicKey: Object;
  encryptedPrivateKey: number[];
  iv: number[];
}

const userKeysSchema = new Schema<IuserKeys>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    publicKey: {
      type: Schema.Types.Mixed,
      required: true,
    },
    encryptedPrivateKey: {
      type: [Number],
      required: true,
    },
    iv: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserKeysModel = mongoose.model<IuserKeys>(
  "UserKeys",
  userKeysSchema,
);
