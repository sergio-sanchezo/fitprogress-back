import mongoose from "mongoose";

const weightLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  weight: { type: Number, required: true },
});

export const WeightLog = mongoose.model("WeightLog", weightLogSchema);
