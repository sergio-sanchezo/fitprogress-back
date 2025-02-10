import { Request, Response } from "express";
import { Measurement } from "../models/Measurement";
import { AppError, handleError } from "../utils/errorHandler";
import { BaseController } from "./baseController";

export class MeasurementController extends BaseController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const measurements = await Measurement.find({ userId }).sort("-date");
      res.json(measurements);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const measurement = new Measurement({ ...req.body, userId });
      await measurement.save();
      res.status(201).json(measurement);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const measurement = await Measurement.findById(req.params.id);
      if (!measurement) {
        throw new AppError("Measurement not found", 404);
      }
      res.json(measurement);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const measurement = await Measurement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!measurement) {
        throw new AppError("Measurement not found", 404);
      }
      res.json(measurement);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const measurement = await Measurement.findByIdAndDelete(req.params.id);
      if (!measurement) {
        throw new AppError("Measurement not found", 404);
      }
      res.status(204).send();
    } catch (error) {
      handleError(error as Error, res);
    }
  }
}
