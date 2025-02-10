import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  totalSets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
});

export const Exercise = mongoose.model("Exercise", exerciseSchema);
