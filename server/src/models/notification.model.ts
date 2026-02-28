import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  user: Types.ObjectId;
  title: String;
  content: String;
  task?: Types.ObjectId;
  read?: boolean;
  notificationType: "request" | "greeting" | "task" | "random";
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    read: {
      type: Boolean,
      default: false,
    },
    notificationType: {
      type: String,
      enum: ["request", "greeting", "task", "random"],
      required: true,
    },
  },
  { timestamps: true },
);

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
