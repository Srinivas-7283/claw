import { Agent } from "../Agent";
import { AgentContext, AgentConfig } from "../types";
import { AIService } from "../../services/ai/AIService";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../lib/convex"; // Shim used here
import { logger } from "../../utils/logger";
import { TelegramService } from "../../services/messaging/TelegramService";

export class MainCoordinator extends Agent {
    constructor(
        context: AgentContext,
        config: AgentConfig,
        aiService: AIService,
        convex: ConvexHttpClient
    ) {
        super(context, config, aiService, convex);
    }

    protected async checkForWork(): Promise<boolean> {
        // 1. Check for unassigned tasks in INBOX
        const inboxTasks = await this.convex.query(api.tasks.listPending, {
            workspaceId: this.context.workspaceId as any,
            status: "inbox"
        });

        if (inboxTasks && inboxTasks.length > 0) {
            await this.logActivity(`Found ${inboxTasks.length} tasks in inbox`);
            return true;
        }

        // 2. Check for notifications (mentions)
        // TODO: Implement notification check

        return false;
    }

    protected async processWork(): Promise<void> {
        // 1. Process Inbox Tasks
        const inboxTasks = await this.convex.query(api.tasks.listPending, {
            workspaceId: this.context.workspaceId as any,
            status: "inbox"
        });

        for (const task of inboxTasks) {
            await this.handleInboxTask(task);
        }
    }

    private async handleInboxTask(task: any) {
        await this.logActivity(`Processing task (INBOX): ${task.title}`);

        // 1. Get available agents
        const agents = await this.convex.query(api.agents.list, {
            workspaceId: this.context.workspaceId as any,
        }) as any[];

        // Filter out self and inactive agents if needed
        const availableAgents = agents.filter(a => a.state !== "SLEEPING" || true); // For now consider all

        const agentList = availableAgents
            .map(a => `- ${a.name} (${a.role}) [ID: ${a._id}]`)
            .join("\n");

        // 2. Load context (if any additional context is needed)
        // const context = await this.loadContext();

        // 3. Ask AI to analyze and assign
        const prompt = `
        You are the Main Coordinator of an AI Agency.
        Your goal is to assign the following task to the most suitable agent.
        
        TASK:
        Title: ${task.title}
        Description: ${task.description}
        Priority: ${task.priority || "normal"}
        
        AVAILABLE AGENTS:
        ${agentList}
        
        - If the task is clear, assign it to the most relevant agent.
        - If the task is vague, you can assign it to yourself (Coordinator) to ask clarifying questions (but for now, just pick the best guess).
        - Return strictly valid JSON.
        
        Response Format:
        {
            "analysis": "Brief reasoning...",
            "assignedToId": "Agent ID from the list",
            "confidence": 0-1
        }
        `;

        try {
            const response = await this.callAI([
                { role: "system", content: "You are the Main Coordinator. Return JSON only." },
                { role: "user", content: prompt }
            ]);

            // Clean JSON (remove markdown fences if any)
            const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
            const decision = JSON.parse(cleanJson);

            await this.logActivity(`AI Decision: Assigned to ${decision.assignedToId} (${decision.analysis})`);

            // 4. execute Assignment
            if (decision.assignedToId) {
                await this.convex.mutation(api.tasks.assign, {
                    taskId: task._id,
                    agentId: decision.assignedToId as any,
                    assignedBy: this.context.agentId as any,
                });

                // 5. Notify User
                await this.notifyUser(task, decision);
            } else {
                logger.warn("AI did not return a valid agent ID", { decision });
            }

        } catch (error: any) {
            logger.error(`Failed to assign task: ${error.message || error}`, {
                stack: error.stack
            });
        }
    }

    private async notifyUser(task: any, decision: any) {
        try {
            const chatId = await this.convex.query(api.telegram.getChatId, {
                workspaceId: this.context.workspaceId as any
            });

            if (chatId) {
                const telegramService = new TelegramService(process.env.CONVEX_URL!);
                const message = `✅ *Task Assigned*\n\nTask: _${task.title}_\nAssigned To: *${decision.assignedToId}* (by Main Coordinator)\n\nReasoning: ${decision.analysis}`;

                if (process.env.TELEGRAM_BOT_TOKEN) {
                    await telegramService.sendMessage(String(chatId), message, {
                        botToken: process.env.TELEGRAM_BOT_TOKEN
                    });
                }
            }
        } catch (error) {
            logger.error("Failed to notify user", { error });
        }
    }
}
