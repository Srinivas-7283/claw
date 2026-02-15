import fs from "fs-extra";
import path from "path";
import { logger } from "../utils/logger";
import { WorkingMemory } from "./types";

export class AgentMemory {
    private baseDir: string;
    private workspaceId: string;
    private agentId: string;

    constructor(workspaceId: string, agentId: string) {
        this.workspaceId = workspaceId;
        this.agentId = agentId;
        // Store memory in: data/agents/<workspaceId>/<agentId>/
        this.baseDir = path.join(process.cwd(), "data", "agents", workspaceId, agentId);
        this.ensureMemoryDirs();
    }

    private async ensureMemoryDirs() {
        await fs.ensureDir(this.baseDir);
        await fs.ensureDir(path.join(this.baseDir, "logs"));
    }

    // ========== WORKING MEMORY (WORKING.md) ==========

    async readWorkingMemory(): Promise<WorkingMemory | null> {
        try {
            const content = await this.readFile("WORKING.md");
            if (!content) return null;
            return this.parseWorkingMemory(content);
        } catch (error) {
            logger.error("Failed to read working memory", { error, agentId: this.agentId });
            return null;
        }
    }

    async writeWorkingMemory(memory: WorkingMemory): Promise<void> {
        const content = this.formatWorkingMemory(memory);
        await this.writeFile("WORKING.md", content);
    }

    // ========== CORE FILES ==========

    async readLongTermMemory(): Promise<string> {
        return (await this.readFile("LONG_TERM_MEMORY.md")) || "";
    }

    async appendLongTermMemory(entry: string): Promise<void> {
        const timestamp = new Date().toISOString();
        const formattedEntry = `\n\n### [${timestamp}]\n${entry}`;
        await fs.appendFile(path.join(this.baseDir, "LONG_TERM_MEMORY.md"), formattedEntry);
    }

    async readContext(): Promise<string> {
        return (await this.readFile("CONTEXT.md")) || "";
    }

    async logDailyActivity(entry: string): Promise<void> {
        const today = new Date().toISOString().split("T")[0];
        const filename = path.join("logs", `${today}.md`);
        const timestamp = new Date().toLocaleTimeString();
        const formattedEntry = `\n- **${timestamp}**: ${entry}`;

        await fs.appendFile(path.join(this.baseDir, filename), formattedEntry);

        // Also update main DAILY_LOG.md for quick access
        await fs.appendFile(path.join(this.baseDir, "DAILY_LOG.md"), formattedEntry);
    }

    // ========== HELPERS ==========

    private async readFile(filename: string): Promise<string | null> {
        const filePath = path.join(this.baseDir, filename);
        if (await fs.pathExists(filePath)) {
            return await fs.readFile(filePath, "utf-8");
        }
        return null;
    }

    private async writeFile(filename: string, content: string): Promise<void> {
        await fs.writeFile(path.join(this.baseDir, filename), content, "utf-8");
    }

    private parseWorkingMemory(content: string): WorkingMemory {
        // Simple markdown parser (can be enhanced)
        const lines = content.split("\n");
        const memory: WorkingMemory = {
            status: "",
            nextSteps: [],
            lastUpdate: Date.now()
        };

        let section = "";
        for (const line of lines) {
            if (line.startsWith("# Current Task")) section = "task";
            else if (line.startsWith("## Status")) section = "status";
            else if (line.startsWith("## Next Steps")) section = "steps";
            else if (line.startsWith("## Blocked On")) section = "blocked";
            else if (line.trim()) {
                if (section === "task" && !memory.currentTask) memory.currentTask = line.trim();
                else if (section === "status" && !memory.status) memory.status = line.trim();
                else if (section === "steps" && line.trim().match(/^[-*1-9]/)) memory.nextSteps.push(line.replace(/^[-*1-9.]\s*/, ''));
                else if (section === "blocked" && line.trim().match(/^[-*]/)) {
                    if (!memory.blockedOn) memory.blockedOn = [];
                    memory.blockedOn.push(line.replace(/^[-*]\s*/, ''));
                }
            }
        }
        return memory;
    }

    private formatWorkingMemory(memory: WorkingMemory): string {
        return `# Current Task
${memory.currentTask || "None"}

## Status
${memory.status || "Idle"}

## Next Steps
${memory.nextSteps.map(step => `- ${step}`).join("\n")}

## Blocked On
${memory.blockedOn?.map(item => `- ${item}`).join("\n") || "None"}

## Last Update
${new Date(memory.lastUpdate).toISOString()}
`;
    }
}
