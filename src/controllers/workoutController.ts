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
}
