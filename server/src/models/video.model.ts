import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVideo extends Document {
  host: Types.ObjectId;
  guest: Types.ObjectId;
  roomID: string;
  startedAt: Date;
  endedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    roomID: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const VideoModel = mongoose.model<IVideo>("Video", videoSchema);
