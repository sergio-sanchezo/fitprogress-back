import express from "express";
import { WeightLogController } from "../controllers/weightLogController";

const router = express.Router();

const controller = new WeightLogController();

router.get("/", controller.getAll.bind(controller));
router.post("/", controller.create.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
