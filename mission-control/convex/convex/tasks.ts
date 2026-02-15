import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List pending tasks for inbox or assignment
export const listPending = query({
    args: {
        workspaceId: v.id("workspaces"),
        status: v.string(), // "inbox" | "assigned" | ...
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tasks")
            .withIndex("by_workspace_status", (q) =>
                q.eq("workspaceId", args.workspaceId).eq("status", args.status as any)
            )
            .collect();
    },
});

// Create a new task
export const create = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        title: v.string(),
        description: v.string(),
        priority: v.string(), // "urgent" | "high" ...
        createdBy: v.id("agents"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("tasks", {
            workspaceId: args.workspaceId,
            title: args.title,
            description: args.description,
            status: "inbox",
            priority: args.priority as any,
            createdBy: args.createdBy,
            version: 1,
            tags: [],
        });
    },
});

// Update task status
export const updateStatus = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.string(),
        agentId: v.id("agents"),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        await ctx.db.patch(args.taskId, {
            status: args.status as any,
            version: task.version + 1,
        });

        // Log to history
        await ctx.db.insert("taskHistory", {
            workspaceId: task.workspaceId,
            taskId: args.taskId,
            oldStatus: task.status,
            newStatus: args.status,
            changedBy: args.agentId,
        });
    },
});

// Assign task
export const assign = mutation({
    args: {
        taskId: v.id("tasks"),
        agentId: v.id("agents"),
        assignedBy: v.id("agents"),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        await ctx.db.patch(args.taskId, {
            assignedTo: args.agentId,
            status: "assigned",
            version: task.version + 1,
        });

        // Log history
        await ctx.db.insert("taskHistory", {
            workspaceId: task.workspaceId,
            taskId: args.taskId,
            oldStatus: task.status,
            newStatus: "assigned",
            changedBy: args.assignedBy,
        });
    },
});
