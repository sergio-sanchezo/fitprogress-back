import mongoose from "mongoose";

const progressImageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    type: { type: String, enum: ["front", "side", "back"], required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ProgressImage = mongoose.model(
  "ProgressImage",
  progressImageSchema
);
