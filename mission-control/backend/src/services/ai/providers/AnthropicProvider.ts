// Anthropic (Claude) Provider Implementation
import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, AIMessage, AIResponse, AIOptions } from "../AIProvider";

export class AnthropicProvider implements AIProvider {
    name = "anthropic";
    private client: Anthropic;

    constructor(apiKey: string) {
        this.client = new Anthropic({ apiKey });
    }

    async call(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
        const systemMessage = messages.find((m) => m.role === "system");
        const userMessages = messages.filter((m) => m.role !== "system");

        const response = await this.client.messages.create({
            model: options?.model || "claude-3-sonnet-20240229",
            max_tokens: options?.maxTokens || 2000,
            messages: userMessages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
            system: systemMessage?.content,
        });

        const content =
            response.content[0].type === "text" ? response.content[0].text : "";

        return {
            content,
            usage: {
                promptTokens: response.usage.input_tokens,
                completionTokens: response.usage.output_tokens,
                totalTokens: response.usage.input_tokens + response.usage.output_tokens,
            },
            model: response.model,
            provider: "anthropic",
        };
    }

    async validateKey(apiKey: string): Promise<boolean> {
        try {
            const client = new Anthropic({ apiKey });
            await client.messages.create({
                model: "claude-3-haiku-20240307",
                max_tokens: 10,
                messages: [{ role: "user", content: "test" }],
            });
            return true;
        } catch {
            return false;
        }
    }

    estimateCost(tokens: number, model: string): number {
        const pricing: Record<string, { input: number; output: number }> = {
            "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
            "claude-3-sonnet-20240229": { input: 0.003, output: 0.015 },
            "claude-3-haiku-20240307": { input: 0.00025, output: 0.00125 },
        };

        const rates = pricing[model] || pricing["claude-3-sonnet-20240229"];
        return (tokens / 1000) * rates.input;
    }
}
