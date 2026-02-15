
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        // 1. Get Active Agents
        const agents = await ctx.db
            .query("agents")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        // 2. Get Tasks (we'll fetch all and filter in memory for now, or use specific indexes)
        // Optimization: In a real app, use separate count queries or specific indexes
        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_workspace_status", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const pendingTasks = tasks.filter(t => t.status !== "done").length;
        const completedTasks = tasks.filter(t => t.status === "done").length;

        // 3. System Status
        // If any agent is "active", system is active.
        const isSystemActive = agents.some(a => a.state === "ACTIVE");

        return {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.state === "ACTIVE").length,
            pendingTasks,
            completedTasks,
            isSystemActive
        };
    },
});
