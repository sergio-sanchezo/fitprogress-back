import { Request, Response } from "express";
import { getStorage } from "firebase-admin/storage";
import { ProgressImage } from "../models/ProgressImage";
import { BaseController } from "./baseController";
import { AppError, handleError } from "../utils/errorHandler";

export class ProgressImageController extends BaseController {
  async uploadImage(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { type, base64Image } = req.body;

      if (!base64Image || !type) {
        throw new AppError("Missing required fields", 400);
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Image.split(",")[1], "base64");

      // Upload to Firebase Storage
      const bucket = getStorage().bucket();
      const fileName = `progress-photos/${userId}/${Date.now()}.jpg`;
      const file = bucket.file(fileName);

      await file.save(buffer, {
        metadata: {
          contentType: "image/jpeg",
        },
      });

      // Get public URL
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "01-01-2100", // Long expiration
      });

      // Save reference in MongoDB
      const progressImage = new ProgressImage({
        userId,
        imageUrl: url,
        type,
        date: new Date(),
      });

      await progressImage.save();

      res.status(201).json(progressImage);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const images = await ProgressImage.find({ userId }).sort("-date");
      res.json(images);
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
      const fileName = image.imageUrl.split("/").pop()?.split("?")[0];
      if (fileName) {
        await bucket.file(`progress-photos/${userId}/${fileName}`).delete();
      }

      // Delete from MongoDB
      await image.deleteOne();

      res.status(204).send();
    } catch (error) {
      handleError(error as Error, res);
    }
  }
}
