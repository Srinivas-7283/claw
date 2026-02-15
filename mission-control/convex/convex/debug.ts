import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setupTestWorkspace = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Create Customer
        const customerId = await ctx.db.insert("customers", {
            email: "test@example.com",
            name: "Test User",
            plan: "starter",
            status: "active",
            createdAt: Date.now(),
        });

        // 2. Create Workspace
        const workspaceId = await ctx.db.insert("workspaces", {
            customerId,
            name: "Test Workspace",
            settings: {
                defaultModel: "gpt-3.5-turbo",
                maxAgents: 5,
                maxTasksPerMonth: 100,
            },
        });

        // 3. Create Main Coordinator Agent
        const agentId = await ctx.db.insert("agents", {
            workspaceId,
            name: "Main Coordinator",
            role: "COORDINATOR",
            state: "SLEEPING",
            level: "LEAD",
            lastWake: Date.now(),
            wakeInterval: 60000,
            config: {
                temperature: 0.7,
                maxTokens: 2000,
            },
        });

        // 4. Register Telegram Chat
        const chatId = await ctx.db.insert("telegramChats", {
            workspaceId,
            telegramChatId: 1111111,
            type: "private",
            username: "johndoe",
            status: "active",
            lastSeen: Date.now(),
        });

        return {
            workspaceId,
            agentId,
            telegramChatId: 1111111
        };
    },
});

export const getTestInfo = query({
    args: {},
    handler: async (ctx) => {
        const workspace = await ctx.db
            .query("workspaces")
            .filter(q => q.eq(q.field("name"), "Test Workspace"))
            .first();

        if (!workspace) return null;

        const agent = await ctx.db
            .query("agents")
            .withIndex("by_workspace", q => q.eq("workspaceId", workspace._id))
            .first();

        return {
            workspaceId: workspace._id,
            agentId: agent?._id
        };
    },
});
