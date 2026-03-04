import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  chatId: Types.ObjectId;
  chatType: "IndividualMessage" | "Group";
  message: string;
  type: string;
  edited?: boolean;
  deleted?: boolean;
  reported?: boolean;
  reactions: { user: Types.ObjectId; reaction: string }[];
  read?: boolean;
  replyOn?: Types.ObjectId | any;
  poll?: Types.ObjectId;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "chatType",
    },
    chatType: {
      type: String,
      required: true,
      enum: ["IndividualMessage", "Group"],
    },
    message: {
      type: String,
      required: true,
    },
    reactions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        reaction: String,
      },
    ],
    type: {
      type: String,
      required: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
    replyOn: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    poll: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
    },
  },
  {
    timestamps: true,
  },
);

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
