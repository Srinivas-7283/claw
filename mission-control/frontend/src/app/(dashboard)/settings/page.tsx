"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Save, Key, Smartphone, MessageSquare } from "lucide-react";

export default function SettingsPage() {
    const workspace = useQuery(api.workspaces.getDefault);
    const workspaceId = workspace?._id;

    // Queries
    const apiKeys = useQuery(api.apiKeys.getActive, workspaceId ? { workspaceId } : "skip") || [];
    const telegramCreds = useQuery(api.messaging.getCredentials, workspaceId ? { workspaceId, channel: "telegram" } : "skip");

    // API Keys State
    const [openaiKey, setOpenaiKey] = useState("");
    const [anthropicKey, setAnthropicKey] = useState("");

    // Messaging State
    const [telegramToken, setTelegramToken] = useState("");

    // Mutations
    const saveApiKey = useMutation(api.apiKeys.save);
    const saveMessaging = useMutation(api.messaging.save);

    const handleSaveApiKeys = async () => {
        if (!workspaceId) {
            alert("No workspace found");
            return;
        }
        if (openaiKey) {
            await saveApiKey({ workspaceId, provider: "openai", encryptedKey: openaiKey }); // In prod: encrypt before sending
        }
        if (anthropicKey) {
            await saveApiKey({ workspaceId, provider: "anthropic", encryptedKey: anthropicKey });
        }
        alert("API Keys saved!");
    };

    const handleSaveMessaging = async () => {
        if (!workspaceId) {
            alert("No workspace found");
            return;
        }
        if (telegramToken) {
            await saveMessaging({
                workspaceId,
                channel: "telegram",
                credentials: JSON.stringify({ botToken: telegramToken }),
                externalId: telegramToken
            });
            alert("Telegram Token saved!");
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
                <p className="text-muted-foreground">Manage workspaces, API keys, and notification channels.</p>
            </div>

            <div className="grid gap-6">
                {/* API Keys Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Key className="h-5 w-5" />
                            <span>AI Provider Keys</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">OpenAI API Key</label>
                            <input
                                type="password"
                                placeholder="sk-..."
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Anthropic API Key</label>
                            <input
                                type="password"
                                placeholder="sk-ant-..."
                                value={anthropicKey}
                                onChange={(e) => setAnthropicKey(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <button
                            onClick={handleSaveApiKeys}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                        >
                            Save API Keys
                        </button>
                    </CardContent>
                </Card>

                {/* Messaging Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Smartphone className="h-5 w-5" />
                            <span>Messaging Channels</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Telegram Bot Token</label>
                            <input
                                type="password"
                                placeholder="123456:ABC-DEF..."
                                value={telegramToken}
                                onChange={(e) => setTelegramToken(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                Your webhook URL: <code>{`https://your-domain.com/webhook/telegram/${telegramToken || "<TOKEN>"}`}</code>
                            </p>
                        </div>
                        <button
                            onClick={handleSaveMessaging}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                        >
                            Save Messaging Config
                        </button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5" />
                            <span>Usage Limits</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span>Daily Token Limit</span>
                                <span className="font-mono">150,000 / 500,000</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[30%]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
