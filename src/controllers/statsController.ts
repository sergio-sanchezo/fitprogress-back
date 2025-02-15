import { Request, Response } from "express";
import { WorkoutInstance } from "../models/WorkoutInstance";
import { handleError } from "../utils/errorHandler";
import { BaseController } from "./baseController";

export class StatsController extends BaseController {
  async getWeeklyStats(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const now = new Date();
      // Calculate start of week (Monday)
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
      );

      // Fetch only completed workouts for the current week
      const instances = await WorkoutInstance.find({
        userId,
        completed: true,
        date: { $gte: startOfWeek },
      }).populate("templateId");

      // Initialize stats
      const stats = {
        totalWorkouts: instances.length,
        totalDuration: 0,
        completedExercises: 0,
        totalWeight: 0,
      };

      // For each completed instance, sum duration, count exercises, and total weight lifted
      instances.forEach((instance) => {
        if (instance.templateId) {
          const template = instance.templateId as any;
          stats.totalDuration += template.duration || 0;
          stats.completedExercises += template.exercises?.length || 0;
          if (template.exercises && Array.isArray(template.exercises)) {
            template.exercises.forEach((exercise: any) => {
              // Calculate total weight for each exercise
              stats.totalWeight +=
                exercise.weight * exercise.reps * exercise.totalSets;
            });
          }
        }
      });

      res.json(stats);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getMonthlyComparison(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      // Allow an optional query parameter "currentDate" for testing.
      const now = req.query.currentDate
        ? new Date(req.query.currentDate as string)
        : new Date();

      // Define the start of the current month based on "now"
      const startOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      // Define the start of last month
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      // Get completed workout instances for current month (up to now) and last month
      const [currentMonthInstances, lastMonthInstances] = await Promise.all([
        WorkoutInstance.find({
          userId,
          completed: true,
          date: { $gte: startOfCurrentMonth, $lt: now },
        }).populate("templateId"),
        WorkoutInstance.find({
          userId,
          completed: true,
          date: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
        }).populate("templateId"),
      ]);

      // Helper: compute stats from an array of instances
      const calculateMonthStats = (instances: any[]) => ({
        totalWorkouts: instances.length,
        totalDuration: instances.reduce(
          (sum, instance) => sum + (instance.templateId?.duration || 0),
          0
        ),
        totalExercises: instances.reduce(
          (sum, instance) =>
            sum + (instance.templateId?.exercises?.length || 0),
          0
        ),
      });

      const currentStats = calculateMonthStats(currentMonthInstances);
      const lastStats = calculateMonthStats(lastMonthInstances);

      // Compute percentage change helper
      const calculateChange = (current: number, previous: number) =>
        previous === 0 ? 0 : ((current - previous) / previous) * 100;

      const comparison = {
        workoutChange: calculateChange(
          currentStats.totalWorkouts,
          lastStats.totalWorkouts
        ),
        durationChange: calculateChange(
          currentStats.totalDuration,
          lastStats.totalDuration
        ),
        exerciseChange: calculateChange(
          currentStats.totalExercises,
          lastStats.totalExercises
        ),
      };

      res.json(comparison);
    } catch (error) {
      handleError(error as Error, res);
    }
  }
}
