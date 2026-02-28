import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  date: string;
  time?: string;
  category?: string;
}

const taskSchema = new Schema<ITask>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must belong to a user"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Done"],
      default: "Todo",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
  },
  { timestamps: true },
);

export const Task =
  mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);
