import { AgentConfig, AgentContext, AgentState, AgentRole, AgentLevel } from "./types";
import { AgentMemory } from "./AgentMemory";
import { AIService } from "../services/ai/AIService";
import { AIMessage } from "../services/ai/AIProvider";
import { logger } from "../utils/logger";
import { ConvexHttpClient } from "convex/browser";

export abstract class Agent {
    protected context: AgentContext;
    protected config: AgentConfig;
    protected memory: AgentMemory;
    protected state: AgentState = "SLEEPING";
    protected aiService: AIService;
    protected convex: ConvexHttpClient;

    constructor(
        context: AgentContext,
        config: AgentConfig,
        aiService: AIService,
        convex: ConvexHttpClient
    ) {
        this.context = context;
        this.config = config;
        this.aiService = aiService;
        this.convex = convex;
        this.memory = new AgentMemory(context.workspaceId, context.agentId);
    }

    // ========== CORE LIFECYCLE ==========

    async wake(): Promise<void> {
        if (this.state !== "SLEEPING") {
            logger.warn(`Agent ${this.context.agentId} woke up but state is ${this.state}`);
            return;
        }

        try {
            this.state = "WAKING";
            await this.logActivity("Waking up");

            // Check for messages/tasks (to be implemented in concrete classes or via mixins)
            const hasWork = await this.checkForWork();

            if (hasWork) {
                this.state = "ACTIVE";
                await this.processWork();
            } else {
                await this.logActivity("HEARTBEAT_OK - No work found");
            }

        } catch (error) {
            logger.error(`Error in agent loop for ${this.context.agentId}`, { error });
            this.state = "OFFLINE";
        } finally {
            if (this.state !== "OFFLINE") {
                this.state = "SLEEPING";
            }
        }
    }

    // ========== ABSTRACT METHODS ==========

    protected abstract checkForWork(): Promise<boolean>;
    protected abstract processWork(): Promise<void>;

    // ========== AI INTERACTION ==========

    protected async callAI(messages: AIMessage[]): Promise<string> {
        const response = await this.aiService.callAI(
            this.context.workspaceId,
            this.context.agentId,
            messages,
            {
                model: this.config.model,
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens
            }
        );
        return response.content;
    }

    // ========== MEMORY HELPERS ==========

    protected async loadContext(): Promise<string> {
        const longTerm = await this.memory.readLongTermMemory();
        const working = await this.memory.readWorkingMemory();
        const projectContext = await this.memory.readContext();

        return `
# PROJECT CONTEXT
${projectContext}

# LONG TERM MEMORY
${longTerm}

# CURRENT STATUS
${working ? JSON.stringify(working, null, 2) : "Idle"}
`;
    }

    protected async logActivity(action: string): Promise<void> {
        logger.info(`[${this.context.role}] ${action}`, {
            workspaceId: this.context.workspaceId,
            agentId: this.context.agentId
        });
        await this.memory.logDailyActivity(action);
    }
}
