// src/app.ts
import express from "express";
import cors from "cors";
import { config } from "./config/config";
import { connectDB } from "./config/database";
import exerciseRoutes from "./routes/exerciseRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import measurementRoutes from "./routes/measurementRoutes";
import weightLogRoutes from "./routes/weightLogRoutes";
import progressImageRoutes from "./routes/progressImageRoutes";
import statsRoutes from "./routes/statsRoutes";
import { validateFirebaseToken } from "./middleware/firebaseAuth";
import morgan from "morgan";

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(validateFirebaseToken);

// Routes
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/weight-logs", weightLogRoutes);
app.use("/api/progress", progressImageRoutes);
app.use("/api/stats", statsRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Internal server error",
    });
  }
);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;
