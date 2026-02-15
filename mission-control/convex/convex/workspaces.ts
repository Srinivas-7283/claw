import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the default workspace, or create one if none exists
export const getDefault = query({
    args: {},
    handler: async (ctx) => {
        const workspace = await ctx.db.query("workspaces").first();
        if (workspace) return workspace;
        return null;
    },
});

export const createDefault = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("workspaces").first();
        if (existing) return existing._id;

        // Create default customer if needed (simplified for this issue)
        let customer = await ctx.db.query("customers").first();
        if (!customer) {
            const customerId = await ctx.db.insert("customers", {
                email: "admin@example.com",
                name: "Admin User",
                plan: "professional",
                status: "active",
                createdAt: Date.now(),
            });
            customer = await ctx.db.get(customerId);
        }

        const workspaceId = await ctx.db.insert("workspaces", {
            customerId: customer!._id,
            name: "Default Workspace",
            settings: {
                defaultModel: "gpt-4",
                maxAgents: 5,
                maxTasksPerMonth: 100,
            },
        });

        return workspaceId;
    },
});
