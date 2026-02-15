import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCredentials = query({
    args: {
        workspaceId: v.id("workspaces"),
        channel: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messagingCredentials")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("channel"), args.channel))
            .first();
    },
});

export const save = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        channel: v.string(),
        credentials: v.string(), // Encrypted JSON string
        externalId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("messagingCredentials")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("channel"), args.channel))
            .first();

        if (existing) {
            return await ctx.db.patch(existing._id, {
                credentials: args.credentials,
                isActive: true,
                externalId: args.externalId,
            });
        }

        return await ctx.db.insert("messagingCredentials", {
            workspaceId: args.workspaceId,
            channel: args.channel as any,
            credentials: args.credentials,
            isActive: true,
            externalId: args.externalId,
        });
    },
});

export const getByExternalId = query({
    args: {
        externalId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messagingCredentials")
            .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
            .first();
    },
});
