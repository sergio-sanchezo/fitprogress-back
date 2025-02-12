// init-db.ts
import mongoose from "mongoose";
import { Exercise } from "../models/Exercise";
import { Workout } from "../models/Workout";
import { Measurement } from "../models/Measurement";
import { WeightLog } from "../models/WeightLog";
import { config } from "./config";

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      Exercise.deleteMany({}),
      Workout.deleteMany({}),
      Measurement.deleteMany({}),
      WeightLog.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // Sample Firebase user ID (replace with your test user's Firebase UID)
    const sampleUserId = "E9vzvaSopzfV3DlXQWHdMKoW7PE2";

    // Create sample exercises
    const exercises = await Exercise.create([
      {
        name: "Press de Banca",
        muscleGroup: "Pecho",
        totalSets: 4,
        reps: 12,
        weight: 60,
        userId: sampleUserId,
      },
      {
        name: "Sentadillas",
        muscleGroup: "Piernas",
        totalSets: 4,
        reps: 12,
        weight: 80,
        userId: sampleUserId,
      },
      {
        name: "Peso Muerto",
        muscleGroup: "Espalda",
        totalSets: 4,
        reps: 12,
        weight: 100,
        userId: sampleUserId,
      },
      {
        name: "Press Militar",
        muscleGroup: "Hombros",
        totalSets: 4,
        reps: 12,
        weight: 40,
        userId: sampleUserId,
      },
      {
        name: "Dominadas",
        muscleGroup: "Espalda",
        totalSets: 3,
        reps: 10,
        weight: 0,
        userId: sampleUserId,
      },
      {
        name: "Curl de Bíceps",
        muscleGroup: "Bíceps",
        totalSets: 3,
        reps: 12,
        weight: 15,
        userId: sampleUserId,
      },
    ]);
    console.log("Created sample exercises");

    // Create sample workouts
    const workouts = await Workout.create([
      {
        name: "Pecho y Tríceps",
        exercises: [exercises[0]._id, exercises[3]._id], // Press de Banca + Press Militar
        date: new Date(),
        duration: 60,
        userId: sampleUserId,
      },
      {
        name: "Espalda y Bíceps",
        exercises: [exercises[2]._id, exercises[4]._id, exercises[5]._id], // Peso Muerto + Dominadas + Curl
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        duration: 55,
        userId: sampleUserId,
      },
      {
        name: "Pierna",
        exercises: [exercises[1]._id], // Sentadillas
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        duration: 45,
        userId: sampleUserId,
      },
    ]);
    console.log("Created sample workouts");

    // Create sample measurements
    const measurements = await Measurement.create([
      {
        date: new Date(),
        chest: 95,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35,
        leftThigh: 55,
        rightThigh: 55,
        leftCalf: 38,
        rightCalf: 38,
        userId: sampleUserId,
      },
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        chest: 98,
        waist: 83,
        hips: 97,
        leftArm: 34,
        rightArm: 34,
        leftThigh: 54,
        rightThigh: 54,
        leftCalf: 37,
        rightCalf: 37,
        userId: sampleUserId,
      },
    ]);
    console.log("Created sample measurements");

    // Create sample weight logs
    const weightLogs = await WeightLog.create([
      {
        date: new Date("2024-01-01"),
        weight: 75,
        userId: sampleUserId,
      },
      {
        date: new Date("2024-01-15"),
        weight: 74.5,
        userId: sampleUserId,
      },
      {
        date: new Date("2024-02-01"),
        weight: 74,
        userId: sampleUserId,
      },
      {
        date: new Date("2024-02-15"),
        weight: 73.5,
        userId: sampleUserId,
      },
    ]);
    console.log("Created sample weight logs");

    console.log("Database initialization completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

initializeDatabase();
