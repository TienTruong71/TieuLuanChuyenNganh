import express from "express";
import { AiChatController } from "../../controllers/AI/AI.controller.js";

const router = express.Router();

router.post("/chat", AiChatController.askPricing);

export default router;
