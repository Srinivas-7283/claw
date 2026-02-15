import { Router } from "express";
import { TelegramService } from "../services/messaging/TelegramService";
import { logger } from "../utils/logger";

const router = Router();
const convexUrl = process.env.CONVEX_URL || "";
const telegramService = new TelegramService(convexUrl);

// Telegram Webhook Handler
router.post("/telegram/:token", async (req, res) => {
    const { token } = req.params;
    const update = req.body;

    // Security check: verify token matches (simple check for now)
    // In production, we might look up the token in DB to identify the workspace

    try {
        await telegramService.handleWebhook(token, update);
        res.status(200).send("OK");
    } catch (error) {
        logger.error("Error handling Telegram webhook", { error });
        res.status(500).send("Error");
    }
});

export default router;
