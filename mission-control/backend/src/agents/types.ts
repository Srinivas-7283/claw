export type AgentRole =
    | "main-coordinator"
    | "seo-specialist"
    | "content-writer"
    | "researcher"
    | "social-media-manager"
    | "developer"
    | "designer"
    | "email-marketer"
    | "product-analyst"
    | "documentation-specialist";

export type AgentState =
    | "SLEEPING"   // Idle, waiting for next heartbeat
    | "WAKING"     // Checking for work
    | "ACTIVE"     // Currently executing a task
    | "WAITING"    // Blocked or waiting for response
    | "OFFLINE";   // Disabled or error state

export type AgentLevel =
    | "INTERN"     // Needs approval, limited scope
    | "SPECIALIST" // Independent in domain
    | "LEAD";      // Can delegate, full autonomy

export interface AgentConfig {
    temperature: number;
    maxTokens: number;
    model?: string;     // Override workspace default
    systemPrompt?: string; // Custom system prompt override
}

export interface AgentContext {
    workspaceId: string;
    agentId: string;
    role: AgentRole;
    level: AgentLevel;
}

export interface WorkingMemory {
    currentTask?: string;
    status: string;
    nextSteps: string[];
    blockedOn?: string[];
    lastUpdate: number;
}
