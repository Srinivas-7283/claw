import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        agentId: v.id("agents"),
        provider: v.string(),
        model: v.string(),
        tokens: v.number(),
        cost: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("apiUsage", {
            workspaceId: args.workspaceId,
            agentId: args.agentId,
            provider: args.provider,
            model: args.model,
            tokens: args.tokens,
            cost: args.cost,
        });
    },
});
