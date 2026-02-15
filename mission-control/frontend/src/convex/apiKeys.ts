import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getActive = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("apiKeys")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
    },
});

export const create = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        provider: v.string(),
        encryptedKey: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("apiKeys", {
            workspaceId: args.workspaceId,
            provider: args.provider as any,
            encryptedKey: args.encryptedKey,
            isActive: true,
            lastValidated: Date.now(),
        });
    },
});
