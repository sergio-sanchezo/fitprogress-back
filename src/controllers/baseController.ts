import { Request } from "express";
import { AppError } from "../utils/errorHandler";

// Base controller with common Firebase auth functionality
export class BaseController {
  protected getUserId(req: Request): string {
    if (!req.user?.uid) {
      throw new AppError("User not authenticated", 401);
    }
    return req.user.uid;
  }
}
