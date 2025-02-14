// src/config/init-db.ts
import mongoose from "mongoose";
import { Exercise } from "../models/Exercise";
import { WorkoutTemplate } from "../models/WorkoutTemplate";
import { WorkoutInstance } from "../models/WorkoutInstance";
import { Measurement } from "../models/Measurement";
import { WeightLog } from "../models/WeightLog";
import { ProgressImage } from "../models/ProgressImage";
import { config } from "./config";

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing data from all collections
    await Promise.all([
      Exercise.deleteMany({}),
      WorkoutTemplate.deleteMany({}),
      WorkoutInstance.deleteMany({}),
      Measurement.deleteMany({}),
      WeightLog.deleteMany({}),
      ProgressImage.deleteMany({}),
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

    // Create workout templates
    const workoutTemplates = await WorkoutTemplate.create([
      {
        name: "Pecho y Tríceps",
        exercises: [exercises[0]._id, exercises[3]._id],
        duration: 60,
        userId: sampleUserId,
        type: "strength",
        muscleGroups: ["Pecho", "Tríceps", "Hombros"],
        frequency: "weekly",
        isActive: true,
      },
      {
        name: "Espalda y Bíceps",
        exercises: [exercises[2]._id, exercises[4]._id, exercises[5]._id],
        duration: 55,
        userId: sampleUserId,
        type: "strength",
        muscleGroups: ["Espalda", "Bíceps"],
        frequency: "weekly",
        isActive: true,
      },
      {
        name: "Pierna",
        exercises: [exercises[1]._id],
        duration: 45,
        userId: sampleUserId,
        type: "strength",
        muscleGroups: ["Piernas"],
        frequency: "weekly",
        isActive: true,
      },
    ]);
    console.log("Created workout templates");

    // Create workout instances for the current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(
      now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
    );

    // Helper function to get week number
    const getWeekNumber = (date: Date): number => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil(
        ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
      );
      return weekNo;
    };

    // Create instances for each template
    const workoutInstances = await WorkoutInstance.create(
      workoutTemplates.map((template, index) => ({
        templateId: template._id,
        userId: sampleUserId,
        date: new Date(
          startOfWeek.getTime() + (index + 1) * 24 * 60 * 60 * 1000
        ), // Spread across the week
        weekNumber: getWeekNumber(startOfWeek),
        year: startOfWeek.getFullYear(),
        completed: index === 0, // Mark first workout as completed
        completedAt: index === 0 ? new Date() : undefined,
        notes:
          index === 0
            ? "Great workout! Increased weight on all exercises"
            : undefined,
      }))
    );
    console.log("Created workout instances for current week");

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

    // Create sample progress images
    await ProgressImage.create([
      {
        userId: sampleUserId,
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/fitprogress-f06dc.firebasestorage.app/o/test.png?alt=media&token=fe34556e-f40a-4449-bec9-2c659b15c6c3",
        type: "front",
        date: new Date(),
        notes: "Front view progress",
      },
      {
        userId: sampleUserId,
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/fitprogress-f06dc.firebasestorage.app/o/test.png?alt=media&token=fe34556e-f40a-4449-bec9-2c659b15c6c3",
        type: "side",
        date: new Date(),
        notes: "Side view progress",
      },
      {
        userId: sampleUserId,
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/fitprogress-f06dc.firebasestorage.app/o/test.png?alt=media&token=fe34556e-f40a-4449-bec9-2c659b15c6c3",
        type: "back",
        date: new Date(),
        notes: "Back view progress",
      },
    ]);
    console.log("Created sample progress images");

    console.log("Database initialization completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

initializeDatabase();
