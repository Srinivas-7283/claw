// OpenAI Provider Implementation
import OpenAI from "openai";
import { AIProvider, AIMessage, AIResponse, AIOptions } from "../AIProvider";

export class OpenAIProvider implements AIProvider {
    name = "openai";
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
    }

    async call(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
        const response = await this.client.chat.completions.create({
            model: options?.model || "gpt-3.5-turbo",
            messages: messages,
            temperature: options?.temperature || 0.7,
            max_tokens: options?.maxTokens || 2000,
        });

        return {
            content: response.choices[0].message.content || "",
            usage: {
                promptTokens: response.usage?.prompt_tokens || 0,
                completionTokens: response.usage?.completion_tokens || 0,
                totalTokens: response.usage?.total_tokens || 0,
            },
            model: response.model,
            provider: "openai",
        };
    }

    async validateKey(apiKey: string): Promise<boolean> {
        try {
            const client = new OpenAI({ apiKey });
            await client.models.list();
            return true;
        } catch {
            return false;
        }
    }

    estimateCost(tokens: number, model: string): number {
        const pricing: Record<string, { input: number; output: number }> = {
            "gpt-4": { input: 0.03, output: 0.06 },
            "gpt-4-turbo": { input: 0.01, output: 0.03 },
            "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
        };

        const rates = pricing[model] || pricing["gpt-3.5-turbo"];
        return (tokens / 1000) * rates.input;
    }
}
