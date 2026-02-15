import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a new Telegram chat with a workspace
export const registerChat = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        telegramChatId: v.number(),
        type: v.union(v.literal("private"), v.literal("group"), v.literal("channel")),
        title: v.optional(v.string()),
        username: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if already registered
        const existing = await ctx.db
            .query("telegramChats")
            .withIndex("by_telegram_chat", (q) => q.eq("telegramChatId", args.telegramChatId))
            .first();

        if (existing) {
            return existing._id;
        }

        return await ctx.db.insert("telegramChats", {
            workspaceId: args.workspaceId,
            telegramChatId: args.telegramChatId,
            type: args.type,
            title: args.title,
            username: args.username,
            status: "active",
            lastSeen: Date.now(),
        });
    },
});

// Process an incoming message from Telegram
export const receiveMessage = mutation({
    args: {
        telegramChatId: v.number(),
        text: v.string(),
        senderName: v.string(),
        workspaceId: v.optional(v.id("workspaces")), // Optional override
    },
    handler: async (ctx, args) => {
        // 1. Find the linked workspace
        let chat = await ctx.db
            .query("telegramChats")
            .withIndex("by_telegram_chat", (q) => q.eq("telegramChatId", args.telegramChatId))
            .first();

        // Auto-registration for valid workspaceId override (e.g. initial setup)
        if (!chat && args.workspaceId) {
            // Create minimal chat record
            const chatId = await ctx.db.insert("telegramChats", {
                workspaceId: args.workspaceId,
                telegramChatId: args.telegramChatId,
                type: "private", // Default assumption
                status: "active",
                lastSeen: Date.now(),
            });
            chat = await ctx.db.get(chatId);
        }

        if (!chat) {
            throw new Error(`Telegram chat ${args.telegramChatId} not registered to any workspace.`);
        }

        const agents = await ctx.db
            .query("agents")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", chat!.workspaceId))
            .collect();

        const reporterAgent = agents[0]; // Just pick one to satisfy FK for now

        if (!reporterAgent) {
            throw new Error("No agents found in workspace to attribute message to.");
        }

        // 3. Create the message
        await ctx.db.insert("messages", {
            workspaceId: chat.workspaceId,
            agentId: reporterAgent._id, // Technical sender (the system)
            content: `[Telegram: ${args.senderName}] ${args.text}`,
            type: "update"
        });

        // 4. Create an INBOX task if it's a new request?
        // allow logic to decide. For now, ALWAYS create an inbox task for visibility.
        await ctx.db.insert("tasks", {
            workspaceId: chat.workspaceId,
            title: `Telegram Message from ${args.senderName}`,
            description: args.text,
            status: "inbox",
            priority: "normal",
            createdBy: reporterAgent._id,
            version: 1,
            tags: ["telegram", "inbox"]
        });
    }
});

export const getChatId = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const chat = await ctx.db
            .query("telegramChats")
            .filter(q => q.eq(q.field("workspaceId"), args.workspaceId))
            .first();

        return chat?.telegramChatId;
    },
});
