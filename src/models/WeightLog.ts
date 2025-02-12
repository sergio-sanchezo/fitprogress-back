import mongoose from "mongoose";

const weightLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    weight: { type: Number, required: true },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

weightLogSchema.index({ userId: 1, date: -1 });

export const WeightLog = mongoose.model("WeightLog", weightLogSchema);
