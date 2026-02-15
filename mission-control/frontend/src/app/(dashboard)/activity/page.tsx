"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function ActivityPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Activity Log</h1>
            <Card>
                <CardContent className="p-6 text-muted-foreground text-center">
                    No recent activity to display.
                </CardContent>
            </Card>
        </div>
    );
}
