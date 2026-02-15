import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="h-16 border-b border-border flex items-center px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                    <h1 className="text-lg font-semibold">Workspace Overview</h1>
                    {/* Add User/Workspace switcher here later */}
                </div>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
