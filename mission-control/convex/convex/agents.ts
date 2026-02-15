import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        role: v.string(),
        level: v.string(),
        config: v.object({
            temperature: v.number(),
            maxTokens: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("agents", {
            workspaceId: args.workspaceId,
            name: args.name,
            role: args.role,
            state: "SLEEPING",
            level: args.level as any,
            wakeInterval: 15 * 60 * 1000, // 15 mins default
            lastWake: Date.now(),
            config: args.config,
        });
    },
});

export const updateStatus = mutation({
    args: {
        agentId: v.id("agents"),
        state: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.agentId, {
            state: args.state as any,
            lastWake: Date.now(),
        });
    },
});

export const get = query({
    args: {
        agentId: v.id("agents"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.agentId);
    },
});

export const list = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agents")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();
    },
});
