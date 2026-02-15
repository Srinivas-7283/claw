// Convex Database Schema - Multi-Tenant Multi-Agent AI System
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // ========== CUSTOMER MANAGEMENT ==========

    customers: defineTable({
        email: v.string(),
        name: v.string(),
        plan: v.union(
            v.literal("starter"),
            v.literal("professional"),
            v.literal("enterprise")
        ),
        status: v.union(
            v.literal("active"),
            v.literal("suspended"),
            v.literal("cancelled")
        ),
        stripeCustomerId: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_stripe", ["stripeCustomerId"]),

    workspaces: defineTable({
        customerId: v.id("customers"),
        name: v.string(),
        settings: v.object({
            defaultModel: v.string(),
            maxAgents: v.number(),
            maxTasksPerMonth: v.number(),
        }),
    }).index("by_customer", ["customerId"]),

    // ========== API KEY MANAGEMENT ==========

    apiKeys: defineTable({
        workspaceId: v.id("workspaces"),
        provider: v.union(
            v.literal("openai"),
            v.literal("anthropic"),
            v.literal("google"),
            v.literal("xai")
        ),
        encryptedKey: v.string(),
        isActive: v.boolean(),
        lastValidated: v.optional(v.number()),
    }).index("by_workspace", ["workspaceId"]),

    // ========== MESSAGING CREDENTIALS ==========

    messagingCredentials: defineTable({
        workspaceId: v.id("workspaces"),
        channel: v.union(
            v.literal("telegram"),
            v.literal("whatsapp")
        ),
        credentials: v.string(), // JSON string of encrypted credentials
        isActive: v.boolean(),
    }).index("by_workspace", ["workspaceId"]),

    telegramChats: defineTable({
        workspaceId: v.id("workspaces"),
        telegramChatId: v.number(),
        type: v.union(v.literal("private"), v.literal("group"), v.literal("channel")),
        title: v.optional(v.string()),
        username: v.optional(v.string()),
        status: v.union(v.literal("active"), v.literal("blocked")),
        lastSeen: v.number(),
    })
        .index("by_telegram_chat", ["telegramChatId"])
        .index("by_workspace", ["workspaceId"]),

    // ========== CORE TABLES ==========

    agents: defineTable({
        workspaceId: v.id("workspaces"),
        name: v.string(),
        role: v.string(),
        state: v.union(
            v.literal("SLEEPING"),
            v.literal("WAKING"),
            v.literal("ACTIVE"),
            v.literal("WAITING"),
            v.literal("OFFLINE")
        ),
        level: v.union(
            v.literal("INTERN"),
            v.literal("SPECIALIST"),
            v.literal("LEAD")
        ),
        preferredProvider: v.optional(v.string()),
        preferredModel: v.optional(v.string()),
        lastWake: v.number(),
        wakeInterval: v.number(),
        config: v.object({
            temperature: v.number(),
            maxTokens: v.number(),
        }),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_workspace_state", ["workspaceId", "state"]),

    tasks: defineTable({
        workspaceId: v.id("workspaces"),
        title: v.string(),
        description: v.string(),
        status: v.union(
            v.literal("inbox"),
            v.literal("assigned"),
            v.literal("in_progress"),
            v.literal("review"),
            v.literal("done"),
            v.literal("blocked")
        ),
        priority: v.union(
            v.literal("urgent"),
            v.literal("high"),
            v.literal("normal"),
            v.literal("low")
        ),
        assignedTo: v.optional(v.id("agents")),
        createdBy: v.id("agents"),
        dueDate: v.optional(v.number()),
        blockedReason: v.optional(v.string()),
        version: v.number(),
        tags: v.array(v.string()),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_workspace_status", ["workspaceId", "status"])
        .index("by_assignee", ["assignedTo"]),

    messages: defineTable({
        workspaceId: v.id("workspaces"),
        taskId: v.optional(v.id("tasks")),
        agentId: v.id("agents"),
        content: v.string(),
        type: v.union(
            v.literal("comment"),
            v.literal("update"),
            v.literal("question"),
            v.literal("handoff")
        ),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_task", ["taskId"]),

    notifications: defineTable({
        workspaceId: v.id("workspaces"),
        recipientId: v.id("agents"),
        type: v.union(
            v.literal("URGENT"),
            v.literal("HIGH"),
            v.literal("NORMAL"),
            v.literal("LOW")
        ),
        content: v.string(),
        taskId: v.optional(v.id("tasks")),
        delivered: v.boolean(),
        read: v.boolean(),
        deliveredAt: v.optional(v.number()),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_recipient", ["recipientId"])
        .index("by_delivered", ["delivered"]),

    documents: defineTable({
        workspaceId: v.id("workspaces"),
        taskId: v.id("tasks"),
        title: v.string(),
        content: v.string(),
        version: v.number(),
        updatedBy: v.id("agents"),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_task", ["taskId"]),

    activityFeed: defineTable({
        workspaceId: v.id("workspaces"),
        agentId: v.id("agents"),
        action: v.string(),
        metadata: v.any(),
    }).index("by_workspace", ["workspaceId"]),

    // ========== MEMORY TABLES ==========

    agentMemory: defineTable({
        workspaceId: v.id("workspaces"),
        agentId: v.id("agents"),
        memoryType: v.union(
            v.literal("WORKING"),
            v.literal("DAILY_LOG"),
            v.literal("LONG_TERM"),
            v.literal("CONTEXT"),
            v.literal("LEARNINGS"),
            v.literal("HANDOFFS")
        ),
        content: v.string(),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_agent_type", ["agentId", "memoryType"]),

    sessionHistory: defineTable({
        workspaceId: v.id("workspaceId"),
        agentId: v.id("agents"),
        conversation: v.array(
            v.object({
                role: v.string(),
                content: v.string(),
                timestamp: v.number(),
            })
        ),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_agent", ["agentId"]),

    // ========== THREAD SUBSCRIPTIONS ==========

    subscriptions: defineTable({
        workspaceId: v.id("workspaces"),
        agentId: v.id("agents"),
        taskId: v.id("tasks"),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_task", ["taskId"])
        .index("by_agent", ["agentId"]),

    // ========== AUDIT TABLES ==========

    taskHistory: defineTable({
        workspaceId: v.id("workspaces"),
        taskId: v.id("tasks"),
        oldStatus: v.string(),
        newStatus: v.string(),
        changedBy: v.id("agents"),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_task", ["taskId"]),

    apiUsage: defineTable({
        workspaceId: v.id("workspaces"),
        agentId: v.id("agents"),
        provider: v.string(),
        model: v.string(),
        tokens: v.number(),
        cost: v.number(),
    })
        .index("by_workspace", ["workspaceId"])
        .index("by_agent", ["agentId"]),

    // ========== USAGE TRACKING ==========

    usageMetrics: defineTable({
        workspaceId: v.id("workspaces"),
        date: v.string(),
        metrics: v.object({
            tasksCreated: v.number(),
            messagesProcessed: v.number(),
            agentWakes: v.number(),
            apiCalls: v.object({
                openai: v.number(),
                anthropic: v.number(),
                google: v.number(),
                xai: v.number(),
            }),
        }),
    }).index("by_workspace_date", ["workspaceId", "date"]),

    // ========== BILLING ==========

    // ========== BILLING (Merged into customers/subscriptions above) ==========

});
