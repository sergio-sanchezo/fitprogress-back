import express from "express";
import { ProgressImageController } from "../controllers/progressImageController";

const router = express.Router();
const controller = new ProgressImageController();

router.get("/", controller.getAll.bind(controller));
router.post("/", controller.create.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
