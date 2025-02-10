import express from "express";
import { MeasurementController } from "../controllers/measurementController";

const router = express.Router();

const controller = new MeasurementController();

router.get("/", controller.getAll.bind(controller));
router.post("/", controller.create.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
