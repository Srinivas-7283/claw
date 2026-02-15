"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bot, Power, Activity } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AgentsPage() {
    const workspaceId = "m175gc4gzmhv2r05f0a4mw53rh814jv5" as any;
    const agents = useQuery(api.agents.list, { workspaceId }) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Active Agents</h2>
                <div className="flex space-x-2">
                    {/* Add action buttons here later */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent: any) => (
                    <Card key={agent._id} className="relative overflow-hidden">
                        <div className={cn(
                            "absolute top-0 left-0 w-1 h-full",
                            agent.state === "ACTIVE" ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
                        )} />

                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-6">
                            <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                            <Bot className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="pl-6">
                            <div className="flex flex-col space-y-1">
                                <span className="text-2xl font-bold">{agent.role}</span>
                                <p className="text-xs text-muted-foreground">Model: {agent.config?.model || 'N/A'}</p>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <span className={cn(
                                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                    agent.state === "ACTIVE"
                                        ? "bg-green-50 text-green-700 ring-green-600/20"
                                        : "bg-zinc-50 text-zinc-600 ring-zinc-500/10"
                                )}>
                                    {agent.state}
                                </span>

                                <div className="flex space-x-2">
                                    <button className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        <Power className="h-4 w-4" />
                                    </button>
                                    <button className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        <Activity className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
