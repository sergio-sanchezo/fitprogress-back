import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    chest: { type: Number, required: true },
    waist: { type: Number, required: true },
    hips: { type: Number, required: true },
    leftArm: { type: Number, required: true },
    rightArm: { type: Number, required: true },
    leftThigh: { type: Number, required: true },
    rightThigh: { type: Number, required: true },
    leftCalf: { type: Number, required: true },
    rightCalf: { type: Number, required: true },
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

measurementSchema.index({ userId: 1, date: -1 });

export const Measurement = mongoose.model("Measurement", measurementSchema);
