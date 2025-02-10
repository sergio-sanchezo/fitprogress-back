import { Request, Response } from "express";
import { Exercise } from "../models/Exercise";
import { AppError, handleError } from "../utils/errorHandler";
import { BaseController } from "./baseController";

export class ExerciseController extends BaseController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const exercises = await Exercise.find({ userId });
      res.json(exercises);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const exercise = new Exercise({ ...req.body, userId });
      await exercise.save();
      res.status(201).json(exercise);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const exercise = await Exercise.findById(req.params.id);
      if (!exercise) {
        throw new AppError("Exercise not found", 404);
      }
      res.json(exercise);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const exercise = await Exercise.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!exercise) {
        throw new AppError("Exercise not found", 404);
      }
      res.json(exercise);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const exercise = await Exercise.findByIdAndDelete(req.params.id);
      if (!exercise) {
        throw new AppError("Exercise not found", 404);
      }
      res.status(204).send();
    } catch (error) {
      handleError(error as Error, res);
    }
  }
}
