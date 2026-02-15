
import { MainCoordinator } from "../agents/impl/MainCoordinator";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../lib/convex";
import * as dotenv from "dotenv";

dotenv.config();

const convexUrl = process.env.CONVEX_URL || "http://127.0.0.1:3210";
const client = new ConvexHttpClient(convexUrl);

async function main() {
    console.log("Starting Assignment Debug...");

    // 1. Get Test Info
    const testInfo = await client.query(api.debug.getTestInfo as any, {});
    if (!testInfo) {
        console.error("Test info not found.");
        return;
    }

    const { workspaceId, agentId } = testInfo;
    console.log(`Workspace: ${workspaceId}, Agent: ${agentId}`);

    // 2. Create Inbox Task
    console.log("Creating Inbox Task...");
    const taskId = await client.mutation(api.tasks.create as any, {
        workspaceId: workspaceId as any,
        title: "Test Task " + Date.now(),
        description: "Debug task for assignment",
        priority: "high",
        createdBy: agentId as any
    });
    console.log(`Task Created: ${taskId}`);

    // Verify it is in inbox
    const inbox = await client.query(api.tasks.listPending as any, { workspaceId: workspaceId as any, status: "inbox" });
    console.log(`Inbox count: ${inbox.length}`);

    // 3. Trigger Main Coordinator
    console.log("Waking up Main Coordinator...");

    // Mock AI Service with correct interface
    const mockAI = {
        callAI: async () => {
            console.log(" [MockAI] Generating response...");
            return {
                content: JSON.stringify({
                    analysis: "Assigning to self",
                    assignedToId: agentId,
                    confidence: 1.0
                }),
                usage: { totalTokens: 100 },
                model: "mock-gpt",
                provider: "mock"
            };
        }
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

    await coordinator.wake();
    console.log("Coordinator cycle finished.");

    // 4. Verify Assignment
    const assignedTasks = await client.query(api.tasks.listPending as any, {
        workspaceId: workspaceId as any,
        status: "assigned"
    });

    const myTask = assignedTasks.find((t: any) => t._id === taskId);

    if (myTask) {
        console.log(`SUCCESS: Task ${myTask._id} is assigned to ${myTask.assignedTo}`);
        if (myTask.assignedTo === agentId) {
            console.log("Agent ID matches.");
        } else {
            console.log("Agent ID mismatch!");
        }
    } else {
        console.log("FAILURE: Task not found in assigned list.");
        // Check if it is still in inbox
        const stillInbox = await client.query(api.tasks.listPending as any, { workspaceId: workspaceId as any, status: "inbox" });
        const isInbox = stillInbox.find((t: any) => t._id === taskId);
        if (isInbox) {
            console.log("Task is still in INBOX.");
        } else {
            console.log("Task is missing entirely (weird).");
        }
    }
}

main().catch(e => console.error(e));
