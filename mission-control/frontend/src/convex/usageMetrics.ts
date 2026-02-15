import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const increment = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        date: v.string(),
        provider: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("usageMetrics")
            .withIndex("by_workspace_date", (q) =>
                q.eq("workspaceId", args.workspaceId).eq("date", args.date)
            )
            .first();

        if (existing) {
            const metrics = existing.metrics;
            // Initialize if missing
            if (!metrics.apiCalls) (metrics as any).apiCalls = {};
            const calls = (metrics as any).apiCalls;
            if (!calls[args.provider]) calls[args.provider] = 0;

            calls[args.provider] += 1;

            await ctx.db.patch(existing._id, { metrics });
        } else {
            await ctx.db.insert("usageMetrics", {
                workspaceId: args.workspaceId,
                date: args.date,
                metrics: {
                    tasksCreated: 0,
                    messagesProcessed: 0,
                    agentWakes: 0,
                    apiCalls: {
                        [args.provider]: 1,
                        openai: 0, anthropic: 0, google: 0, xai: 0 // defaults
                    },
                },
            });
        }
    },
});
