import express from "express";
import { WorkoutController } from "../controllers/workoutController";

const router = express.Router();

const controller = new WorkoutController();

router.get("/", controller.getAll.bind(controller));
router.post("/", controller.create.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
