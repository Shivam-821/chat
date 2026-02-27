import mongoose, { Schema, Document, Types } from "mongoose";

export interface IIndividual extends Document {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  lastMessage?: Types.ObjectId;
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
  },
  {
    timestamps: true,
  },
);

export const IndividualMessageModel = mongoose.model<IIndividual>(
  "IndividualMessage",
  individualMessageSchema,
);
