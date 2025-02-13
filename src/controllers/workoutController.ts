import { Request, Response } from "express";
import { Workout } from "../models/Workout";
import { AppError, handleError } from "../utils/errorHandler";
import { BaseController } from "./baseController";

export class WorkoutController extends BaseController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const workouts = await Workout.find({ userId }).populate("exercises");
      res.json(workouts);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const workout = new Workout({ ...req.body, userId });
      await workout.save();
      res.status(201).json(workout);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const workout = await Workout.findById(req.params.id).populate(
        "exercises"
      );
      if (!workout) {
        throw new AppError("Workout not found", 404);
      }
      res.json(workout);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      }).populate("exercises");
      if (!workout) {
        throw new AppError("Workout not found", 404);
      }
      res.json(workout);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const workout = await Workout.findByIdAndDelete(req.params.id);
      if (!workout) {
        throw new AppError("Workout not found", 404);
      }
      res.status(204).send();
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async suggestUpcoming(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const now = new Date();

      // Calculate start of the week (assuming week starts on Monday)
      const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
      // If Sunday (0), treat it as 7 so that Monday is always start
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysFromMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      // Retrieve all workouts for this user
      const allWorkouts = await Workout.find({ userId });

      // Group workouts by name
      const workoutsByName: { [key: string]: any[] } = {};
      allWorkouts.forEach((workout) => {
        if (!workoutsByName[workout.name]) {
          workoutsByName[workout.name] = [];
        }
        workoutsByName[workout.name].push(workout);
      });

      // For each routine type, check if any instance was already done this week
      const suggestedWorkouts: any[] = [];
      for (const name in workoutsByName) {
        const workouts = workoutsByName[name];

        // Check if any instance in this group has a scheduled date in the past
        // (i.e. between the start of the week and now). We assume that means it was done.
        const alreadyDoneThisWeek = workouts.some((w) => {
          const wDate = new Date(w.date);
          return wDate >= startOfWeek && wDate < now;
        });

        if (!alreadyDoneThisWeek) {
          // Among this routine type, choose the upcoming instance (date >= now)
          const upcomingInstances = workouts.filter(
            (w) => new Date(w.date) >= now
          );
          if (upcomingInstances.length > 0) {
            // Sort upcoming instances by date ascending
            upcomingInstances.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            // Suggest the earliest upcoming instance
            suggestedWorkouts.push(upcomingInstances[0]);
          }
        }
      }

      // Sort the final suggestions by date ascending
      suggestedWorkouts.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      res.json(suggestedWorkouts);
    } catch (error) {
      handleError(error as Error, res);
    }
  }
}
