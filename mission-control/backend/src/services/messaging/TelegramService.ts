import axios from "axios";
import { logger } from "../../utils/logger";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../lib/convex"; // Use shim

type Id<T> = string; // Mock Id type for backend

export interface TelegramConfig {
    botToken: string;
}

export class TelegramService {
    private convex: ConvexHttpClient;

    constructor(convexUrl: string) {
        this.convex = new ConvexHttpClient(convexUrl);
    }

    // Handle incoming webhook updates
    async handleWebhook(token: string, update: any) {
        if (!update.message || !update.message.text) return;

        // 1. Verify token exists in DB and get workspace
        const credentials = await this.convex.query(api.messaging.getByExternalId, {
            externalId: token
        });

        if (!credentials || !credentials.isActive) {
            logger.warn("Received webhook with invalid or inactive token", { token });
            throw new Error("Invalid token");
        }

        const workspaceId = credentials.workspaceId;

        // 2. Process message
        await this.handleUpdate(update, workspaceId);
    }

    // Handle incoming webhook updates (Internal)
    async handleUpdate(update: any, workspaceId?: string) {
        if (!update.message || !update.message.text) return;

        const chatId = update.message.chat.id;
        const text = update.message.text;
        const user = update.message.from;

        logger.info("Received Telegram message", { chatId, text, user });

        // TODO: Verify customer bot token if workspaceId provided (multitenant)

        // Logic:
        // 1. Check if user is registered in this workspace
        // 2. If valid, create a Task in "Inbox"
        // 3. Or route to specific agent if in thread

        // For now, simple echo/task creation mock
        await this.processMessage(text, chatId, user, workspaceId);
    }

    // Send message to Telegram
    async sendMessage(chatId: string, text: string, config: TelegramConfig) {
        try {
            const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
            await axios.post(url, {
                chat_id: chatId,
                text: text,
                parse_mode: "Markdown",
            });
        } catch (error) {
            logger.error("Failed to send Telegram message", { error, chatId });
            throw error;
        }
    }

    // Set webhook
    async setWebhook(url: string, config: TelegramConfig) {
        try {
            const webhookUrl = `https://api.telegram.org/bot${config.botToken}/setWebhook`;
            await axios.post(webhookUrl, { url });
            logger.info("Telegram webhook set", { url });
        } catch (error) {
            logger.error("Failed to set Telegram webhook", { error });
            throw error;
        }
    }

    private async processMessage(text: string, chatId: number, user: any, workspaceId?: string) {
        try {
            await this.convex.mutation(api.telegram.receiveMessage, {
                telegramChatId: chatId,
                text: text,
                senderName: user.first_name || user.username || "Unknown",
                workspaceId: workspaceId as any,
            });

            logger.info(`Processed message from ${user.username}: ${text}`);
        } catch (error: any) {
            logger.error("Failed to process Telegram message in Convex", {
                error: error.message || error,
                stack: error.stack,
                details: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
        }
    }
}
