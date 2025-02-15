import mongoose, { Schema, Document } from "mongoose";
import { Exercise } from "../types";

export interface IWorkoutTemplate extends Document {
  name: string;
  exercises: mongoose.Types.ObjectId[] | Exercise[];
  duration: number;
  userId: string;
  type?: "strength" | "cardio" | "flexibility" | "mixed";
  muscleGroups?: string[];
  frequency: "daily" | "weekly" | "monthly";
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const workoutTemplateSchema = new Schema<IWorkoutTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    exercises: [
      {
        type: Schema.Types.ObjectId,
        ref: "Exercise",
        required: true,
      },
    ],
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "mixed"],
      default: "strength",
    },
    muscleGroups: [
      {
        type: String,
        trim: true,
      },
    ],
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
      default: "weekly",
    },
  },
  {
    timestamps: true,
  }
);

export const WorkoutTemplate = mongoose.model<IWorkoutTemplate>(
  "WorkoutTemplate",
  workoutTemplateSchema
);
