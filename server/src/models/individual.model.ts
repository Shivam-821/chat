import mongoose, { Schema, Document, Types } from "mongoose";

export interface IIndividual extends Document {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  pinnedMessage?: Types.ObjectId;
  secureChat?: {
    user: Types.ObjectId;
    password: string;
  }[];
}

const individualMessageSchema = new Schema<IIndividual>(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    pinnedMessage: {
      // only one message can be pinned at a time
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    secureChat: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        password: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const IndividualMessageModel = mongoose.model<IIndividual>(
  "IndividualMessage",
  individualMessageSchema,
);
