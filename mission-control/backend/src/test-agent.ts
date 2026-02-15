import { MainCoordinator } from "./agents/impl/MainCoordinator";
import { AIService } from "./services/ai/AIService";
import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
    console.log("🚀 Starting Agent Test...");

    const CONVEX_URL = process.env.CONVEX_URL;
    if (!CONVEX_URL) throw new Error("CONVEX_URL missing");

    // Initialize services
    const convex = new ConvexHttpClient(CONVEX_URL);
    const aiService = new AIService(CONVEX_URL);

    // Mock workspace/agent IDs (in real app, these come from DB)
    // We need to create these in DB first or mock them
    const workspaceId = "mock_workspace_id";
    const agentId = "mock_agent_id";

    const coordinator = new MainCoordinator(
        {
            workspaceId,
            agentId,
            role: "main-coordinator",
            level: "LEAD"
        },
        {
            temperature: 0.7,
            maxTokens: 2000,
            model: "gpt-3.5-turbo"
        },
        aiService,
        convex
    );

    console.log("💤 Current State:", (coordinator as any).state);

    console.log("⏰ Waking agent...");
    await coordinator.wake();

    console.log("💤 Current State:", (coordinator as any).state);
}

main().catch(console.error);
