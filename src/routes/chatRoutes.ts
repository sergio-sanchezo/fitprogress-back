import express from "express";
import { ChatController } from "../controllers/chatController";

const router = express.Router();
const controller = new ChatController();

router.post("/", controller.chat.bind(controller));
router.post("/clear", controller.clearHistory.bind(controller));

export default router;
