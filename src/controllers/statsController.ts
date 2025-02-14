import { Request, Response } from "express";
import { WorkoutInstance } from "../models/WorkoutInstance";
import { handleError } from "../utils/errorHandler";
import { BaseController } from "./baseController";

export class StatsController extends BaseController {
  async getWeeklyStats(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
      );

      // Get instances for this week
      const instances = await WorkoutInstance.find({
        userId,
        date: { $gte: startOfWeek },
      }).populate("templateId");

      // Calculate stats
      const stats = {
        totalWorkouts: instances.length,
        completedWorkouts: instances.filter((i) => i.completed).length,
        totalDuration: 0,
        completedExercises: 0,
      };

      // Sum up the durations from the templates
      instances.forEach((instance) => {
        if (instance.completed && instance.templateId) {
          const template = instance.templateId as any;
          stats.totalDuration += template.duration || 0;
          stats.completedExercises += template.exercises?.length || 0;
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
      const now = new Date();
      const startOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      // Get instances for current and previous month
      const [currentMonthInstances, lastMonthInstances] = await Promise.all([
        WorkoutInstance.find({
          userId,
          date: { $gte: startOfCurrentMonth, $lt: now },
          completed: true,
        }).populate("templateId"),
        WorkoutInstance.find({
          userId,
          date: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
          completed: true,
        }).populate("templateId"),
      ]);

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

      // Calculate percentage changes
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
