import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPollOption {
  text: string;
  votes: Types.ObjectId[];
}

export interface IPoll extends Document {
  groupId: Types.ObjectId;
  createdBy: Types.ObjectId;
  question: string;
  allowMultiple: boolean;
  options: IPollOption[];
}

const pollSchema = new Schema<IPoll>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    allowMultiple: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        text: { type: String, required: true },
        votes: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
  },
  { timestamps: true },
);

export const PollModel = mongoose.model<IPoll>("Poll", pollSchema);
