import { Request, Response, NextFunction } from "express";
import { auth } from "firebase-admin";
import admin from "firebase-admin";
import { config } from "../config/config";

admin.initializeApp({
  credential: admin.credential.cert(
    config.serviceAccount as admin.ServiceAccount
  ),
});

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

export const validateFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth().verifyIdToken(token);

    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }
};
