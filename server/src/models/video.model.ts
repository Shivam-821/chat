import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVideo extends Document {
  host: Types.ObjectId;
  guest?: Types.ObjectId;
  roomID: string;
  startedAt: Date;
  endedAt?: Date;
  isEnded: boolean;
}

const videoSchema = new Schema<IVideo>({
  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
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
    default: null,
  },
  isEnded: {
    type: Boolean,
    default: false,
  },
});

export const VideoModel = mongoose.model<IVideo>("Video", videoSchema);
