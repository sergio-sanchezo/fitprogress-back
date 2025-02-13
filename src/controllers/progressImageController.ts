import { Request, Response } from "express";
import { ProgressImage } from "../models/ProgressImage";
import { AppError, handleError } from "../utils/errorHandler";
import { BaseController } from "./baseController";
import { getStorage } from "firebase-admin/storage";

export class ProgressImageController extends BaseController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const images = await ProgressImage.find({ userId }).sort("-date");
      res.json(images);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { imageUrl, type } = req.body;

      if (!imageUrl || !type) {
        throw new AppError("Missing required fields", 400);
      }

      const progressImage = new ProgressImage({
        userId,
        imageUrl,
        type,
        date: new Date(),
      });

      await progressImage.save();
      res.status(201).json(progressImage);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const image = await ProgressImage.findById(req.params.id);

      if (!image) {
        throw new AppError("Image not found", 404);
      }

      if (image.userId !== userId) {
        throw new AppError("Unauthorized", 403);
      }

      // Delete from Firebase Storage
      const bucket = getStorage().bucket();
      const imageFileName = image.imageUrl.split("/").pop()?.split("?")[0];

      if (imageFileName) {
        try {
          await bucket
            .file(`progress-photos/${userId}/${imageFileName}`)
            .delete();
        } catch (storageError) {
          console.error("Error deleting from storage:", storageError);
        }
      }

      // Delete from database
      await image.deleteOne();
      res.status(204).send();
    } catch (error) {
      handleError(error as Error, res);
    }
  }
}
