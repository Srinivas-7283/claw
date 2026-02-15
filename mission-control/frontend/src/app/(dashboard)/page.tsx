"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, Clock } from "lucide-react";

export default function DashboardPage() {
    const workspace = useQuery(api.workspaces.getDefault);
    const createWorkspace = useMutation(api.workspaces.createDefault);

    useEffect(() => {
        if (workspace === null) {
            createWorkspace();
        }
    }, [workspace, createWorkspace]);

    const stats = useQuery(api.dashboard.getStats, workspace ? { workspaceId: workspace._id } : "skip");

    // Default values while loading
    const activeAgents = stats?.activeAgents ?? 0;
    const pendingTasks = stats?.pendingTasks ?? 0;
    const completedTasks = stats?.completedTasks ?? 0;
    const isSystemActive = stats?.isSystemActive ?? false;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Active Agents" value={activeAgents.toString()} icon={Activity} />
                <StatsCard title="Pending Tasks" value={pendingTasks.toString()} icon={Clock} />
                <StatsCard title="Completed Today" value={completedTasks.toString()} icon={CheckCircle} />
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-medium mb-4">System Status</h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-sm">
                        <div className={cn("h-2 w-2 rounded-full animate-pulse", isSystemActive ? "bg-green-500" : "bg-yellow-500")} />
                        <span>{isSystemActive ? "Core Systems Operational" : "System Idle"}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {activeAgents} Agents active. {stats?.totalAgents ?? 0} Agents total.
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
