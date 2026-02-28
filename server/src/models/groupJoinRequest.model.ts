import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGroupJoinRequest extends Document {
  sender: Types.ObjectId;
  group: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
}

const groupJoinRequestSchema = new Schema<IGroupJoinRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate pending requests for the same user+group
groupJoinRequestSchema.index({ sender: 1, group: 1 }, { unique: true });

export const GroupJoinRequestModel = mongoose.model<IGroupJoinRequest>(
  "GroupJoinRequest",
  groupJoinRequestSchema,
);
