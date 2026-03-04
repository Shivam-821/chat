import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGroup extends Document {
  name: string;
  admin: Types.ObjectId;
  members: [Types.ObjectId];
  lastMessage?: Types.ObjectId;
  pinnedMessage?: Types.ObjectId;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    pinnedMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    }
  },
  {
    timestamps: true,
  },
);

export const GroupModel = mongoose.model<IGroup>("Group", groupSchema);
