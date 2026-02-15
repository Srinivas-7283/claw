
import { MainCoordinator } from "../agents/impl/MainCoordinator";
import { AIService } from "../services/ai/AIService";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../lib/convex";
import * as dotenv from "dotenv";

dotenv.config();

const convexUrl = process.env.CONVEX_URL || "http://127.0.0.1:3210";
const client = new ConvexHttpClient(convexUrl);

async function main() {
    console.log("🧪 Starting Assignment Test...");

    // 1. Get Test Info
    console.log("setup: Retrieving test info...");
    const testInfo = await client.query(api.debug.getTestInfo as any, {});

    if (!testInfo) {
        console.error("❌ Test info not found. Please run 'npx convex run debug:setupTestWorkspace' first.");
        return;
    }

    const { workspaceId, agentId } = testInfo;
    console.log(`✅ Loaded Workspace: ${workspaceId}, Agent: ${agentId}`);

    // 2. Create Inbox Task
    console.log("action: Creating Inbox Task...");
    const taskId = await client.mutation(api.tasks.create as any, {
        workspaceId: workspaceId as any,
        title: "Write a blog post about AI Agents",
        description: "We need a 1000 word article on how AI agents are changing the workforce.",
        priority: "high",
        createdBy: agentId as any
    });
    console.log(`✅ Task Created: ${taskId}`);

    // 3. Trigger Main Coordinator
    console.log("action: Waking up Main Coordinator...");

    // Mock AI Service
    const mockAI = {
        generateResponse: async () => JSON.stringify({
            analysis: "This is a content task.",
            assignedToId: agentId,  // Assign to self for simplcity in this test, or we'd need a writer agent
            confidence: 0.95
        })
    } as any;

    const coordinator = new MainCoordinator(
        {
            agentId: agentId as unknown as string,
            workspaceId: workspaceId as unknown as string,
            role: "main-coordinator",
            level: "LEAD"
        },
        { temperature: 0.7, maxTokens: 1000 },
        mockAI,
        client
    );

    console.log("action: Running coordinator.wake()...");
    await coordinator.wake();

    // 4. Verify Assignment
    const updatedTask = await client.query(api.tasks.listPending as any, {
        workspaceId: workspaceId as any,
        status: "assigned"
    });

    // The query 'listPending' might filter by status. 
    // If status is 'assigned', we should find it.

    // Note: listPending args are { workspaceId, status }

    // However, MainCoordinator logic calls `api.tasks.assign` which sets status="assigned" and `assignedTo`.

    // Let's query specifically for this task ID using `api.tasks.listPending` is okay if we filter by status="assigned".

    const assigned = updatedTask.find((t: any) => t._id === taskId);

    if (assigned) {
        if (assigned.assignedTo === agentId) {
            console.log("✅ SUCCESS: Task assigned to agent!");
        } else {
            console.error(`❌ FAILURE: Task assigned but to wrong agent. Expected ${agentId}, got ${assigned.assignedTo}`);
        }
    } else {
        console.error("❌ FAILURE: Task not found in 'assigned' list.", updatedTask);
    }
}

main();
