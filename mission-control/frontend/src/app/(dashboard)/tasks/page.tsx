"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const COLUMNS = [
    { id: "inbox", title: "Inbox" },
    { id: "assigned", title: "Assigned" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
];

export default function TasksPage() {
    const workspace = useQuery(api.workspaces.getDefault);
    const workspaceId = workspace?._id;

    // Fetch tasks for each status
    const inboxTasks = useQuery(api.tasks.listPending, workspaceId ? { workspaceId, status: "inbox" } : "skip") || [];
    const assignedTasks = useQuery(api.tasks.listPending, workspaceId ? { workspaceId, status: "assigned" } : "skip") || [];
    const inProgressTasks = useQuery(api.tasks.listPending, workspaceId ? { workspaceId, status: "in_progress" } : "skip") || [];
    const doneTasks = useQuery(api.tasks.listPending, workspaceId ? { workspaceId, status: "done" } : "skip") || [];

    const getTasks = (status: string) => {
        switch (status) {
            case "inbox": return inboxTasks;
            case "assigned": return assignedTasks;
            case "in_progress": return inProgressTasks;
            case "done": return doneTasks;
            default: return [];
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] overflow-x-auto">
            <div className="flex space-x-6 h-full min-w-max pb-4">
                {COLUMNS.map((col) => {
                    const tasks = getTasks(col.id);
                    return (
                        <div key={col.id} className="w-80 flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">{col.title}</h3>
                                <span className="text-xs text-muted-foreground">{tasks.length}</span>
                            </div>

                            <div className="flex-1 bg-muted/50 rounded-xl p-3 space-y-3 overflow-y-auto">
                                {tasks.map((task: any) => (
                                    <Card key={task._id} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="text-sm font-medium leading-snug">{task.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                                                    task.assignedTo ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {task.assignedTo || "Unassigned"}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
