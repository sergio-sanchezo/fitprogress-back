import { Request, Response } from "express";
import { WeightLog } from "../models/WeightLog";
import { AppError, handleError } from "../utils/errorHandler";
import { BaseController } from "./baseController";

export class WeightLogController extends BaseController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const weightLogs = await WeightLog.find({ userId }).sort("-date");
      res.json(weightLogs);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const weightLog = new WeightLog({ ...req.body, userId });
      await weightLog.save();
      res.status(201).json(weightLog);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const weightLog = await WeightLog.findById(req.params.id);
      if (!weightLog) {
        throw new AppError("WeightLog not found", 404);
      }
      res.json(weightLog);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const weightLog = await WeightLog.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!weightLog) {
        throw new AppError("WeightLog not found", 404);
      }
      res.json(weightLog);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const weightLog = await WeightLog.findByIdAndDelete(req.params.id);
      if (!weightLog) {
        throw new AppError("WeightLog not found", 404);
      }
      res.status(204).send();
    } catch (error) {
      handleError(error as Error, res);
    }
  }
}
