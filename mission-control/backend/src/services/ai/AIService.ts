// AI Service - Manages all AI providers and workspace-specific calls
import { AIProvider, AIMessage, AIResponse, AIOptions } from "./AIProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { AnthropicProvider } from "./providers/AnthropicProvider";
import { GoogleProvider } from "./providers/GoogleProvider";
import { XAIProvider } from "./providers/XAIProvider";
import { decrypt } from "../../utils/encryption";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../lib/convex"; // Shim used here

export class AIService {
    private convex: ConvexHttpClient;

    constructor(convexUrl: string) {
        this.convex = new ConvexHttpClient(convexUrl);
    }

    async getProviderForWorkspace(workspaceId: string): Promise<AIProvider> {
        // Get workspace's active API keys
        const apiKeys = await this.convex.query(api.apiKeys.getActive, {
            workspaceId,
        });

        if (!apiKeys || apiKeys.length === 0) {
            throw new Error("No active API keys configured for this workspace");
        }

        // Use first active key (or implement priority logic)
        const keyConfig = apiKeys[0];
        const decryptedKey = decrypt(keyConfig.encryptedKey);

        // Create provider instance
        return this.createProvider(keyConfig.provider, decryptedKey);
    }

    async callAI(
        workspaceId: string,
        agentId: string,
        messages: AIMessage[],
        options?: AIOptions
    ): Promise<AIResponse> {
        const provider = await this.getProviderForWorkspace(workspaceId);
        const response = await provider.call(messages, options);

        // Track usage
        await this.trackUsage(workspaceId, agentId, provider.name, response);

        return response;
    }

    async validateAPIKey(provider: string, apiKey: string): Promise<boolean> {
        const providerInstance = this.createProvider(provider, apiKey);
        return await providerInstance.validateKey(apiKey);
    }

    private createProvider(provider: string, apiKey: string): AIProvider {
        switch (provider) {
            case "openai":
                return new OpenAIProvider(apiKey);
            case "anthropic":
                return new AnthropicProvider(apiKey);
            case "google":
                return new GoogleProvider(apiKey);
            case "xai":
                return new XAIProvider(apiKey);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    private async trackUsage(
        workspaceId: string,
        agentId: string,
        provider: string,
        response: AIResponse
    ): Promise<void> {
        const cost = this.calculateCost(response);

        // Log API usage
        await this.convex.mutation(api.apiUsage.create, {
            workspaceId,
            agentId,
            provider,
            model: response.model,
            tokens: response.usage.totalTokens,
            cost,
        });

        // Update daily metrics
        const today = new Date().toISOString().split("T")[0];
        await this.convex.mutation(api.usageMetrics.increment, {
            workspaceId,
            date: today,
            provider,
        });
    }

    private calculateCost(response: AIResponse): number {
        const provider = this.createProvider(response.provider, "dummy-key");
        return provider.estimateCost(response.usage.totalTokens, response.model);
    }
}
