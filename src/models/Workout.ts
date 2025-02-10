import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  exercises: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
    },
  ],
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
});

export const Workout = mongoose.model("Workout", workoutSchema);
