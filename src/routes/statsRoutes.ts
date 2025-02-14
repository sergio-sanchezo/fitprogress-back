import express from "express";
import { StatsController } from "../controllers/statsController";

const router = express.Router();
const controller = new StatsController();

router.get("/weekly", controller.getWeeklyStats.bind(controller));
router.get("/monthly", controller.getMonthlyComparison.bind(controller));

export default router;
