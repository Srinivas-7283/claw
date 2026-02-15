// xAI (Grok) Provider Implementation
import axios from "axios";
import { AIProvider, AIMessage, AIResponse, AIOptions } from "../AIProvider";

export class XAIProvider implements AIProvider {
    name = "xai";
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async call(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
        const response = await axios.post(
            "https://api.x.ai/v1/chat/completions",
            {
                model: options?.model || "grok-beta",
                messages: messages,
                temperature: options?.temperature || 0.7,
                max_tokens: options?.maxTokens || 2000,
            },
            {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return {
            content: response.data.choices[0].message.content,
            usage: {
                promptTokens: response.data.usage.prompt_tokens,
                completionTokens: response.data.usage.completion_tokens,
                totalTokens: response.data.usage.total_tokens,
            },
            model: response.data.model,
            provider: "xai",
        };
    }

    async validateKey(apiKey: string): Promise<boolean> {
        try {
            await axios.post(
                "https://api.x.ai/v1/chat/completions",
                {
                    model: "grok-beta",
                    messages: [{ role: "user", content: "test" }],
                    max_tokens: 10,
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );
            return true;
        } catch {
            return false;
        }
    }

    estimateCost(tokens: number, model: string): number {
        // Grok pricing (estimated, adjust based on actual)
        return (tokens / 1000) * 0.01;
    }
}
