// src/models/WorkoutInstance.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { IWorkoutTemplate } from "./WorkoutTemplate";

export interface IWorkoutInstance extends Document {
  templateId: Types.ObjectId;
  userId: string;
  date: Date;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
  weekNumber: number;
  year: number;
  progress: any[]; // Stores the exercises progress data
  markAsCompleted: (completionData: {
    exercises: any[];
    completedAt: string;
    notes?: string;
  }) => Promise<IWorkoutInstance>;
}

const workoutInstanceSchema = new Schema<IWorkoutInstance>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutTemplate",
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    progress: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add instance method to mark as completed
workoutInstanceSchema.methods.markAsCompleted =
  async function (completionData: {
    exercises: any[];
    completedAt: string;
    notes?: string;
  }): Promise<IWorkoutInstance> {
    this.completed = true;
    this.completedAt = new Date(completionData.completedAt);
    this.notes = completionData.notes;
    this.progress = completionData.exercises;
    return this.save();
  };

// (The rest of the schema – static methods, helper functions – remains unchanged)
export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}

function suggestDateForWorkout(
  template: IWorkoutTemplate & Document,
  weekStart: Date
): Date {
  const suggestedDate = new Date(weekStart);
  suggestedDate.setDate(
    suggestedDate.getDate() + Math.floor(Math.random() * 7)
  );
  return suggestedDate;
}

interface WorkoutInstanceModel extends mongoose.Model<IWorkoutInstance> {
  findCurrentWeek(userId: string): Promise<IWorkoutInstance[]>;
  createWeekInstances(userId: string, date: Date): Promise<IWorkoutInstance[]>;
}

workoutInstanceSchema.statics.createWeekInstances = async function (
  userId: string,
  date: Date
): Promise<IWorkoutInstance[]> {
  const weekNumber = getWeekNumber(date);
  const year = date.getFullYear();

  const templates = await mongoose
    .model<IWorkoutTemplate>("WorkoutTemplate")
    .find({ userId, isActive: true });

  const existingInstances = await this.find({ userId, weekNumber, year });
  const existingTemplateIds = new Set(
    existingInstances.map((i: { templateId: { toString: () => any } }) =>
      i.templateId.toString()
    )
  );

  const newInstances = [];
  for (const template of templates) {
    if (!existingTemplateIds.has((template as any)._id.toString())) {
      newInstances.push({
        templateId: template._id,
        userId,
        date: suggestDateForWorkout(template, date),
        weekNumber,
        year,
        completed: false,
      });
    }
  }
  if (newInstances.length > 0) {
    await this.insertMany(newInstances);
  }
  return this.find({ userId, weekNumber, year }).populate("templateId");
};

workoutInstanceSchema.statics.findCurrentWeek = async function (
  userId: string
): Promise<IWorkoutInstance[]> {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const year = now.getFullYear();
  return this.find({ userId, weekNumber: currentWeek, year }).populate(
    "templateId"
  );
};

export const WorkoutInstance = mongoose.model<
  IWorkoutInstance,
  WorkoutInstanceModel
>("WorkoutInstance", workoutInstanceSchema);
