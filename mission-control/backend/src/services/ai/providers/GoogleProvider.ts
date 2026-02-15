// Google Gemini Provider Implementation
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIMessage, AIResponse, AIOptions } from "../AIProvider";

export class GoogleProvider implements AIProvider {
    name = "google";
    private client: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.client = new GoogleGenerativeAI(apiKey);
    }

    async call(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
        const model = this.client.getGenerativeModel({
            model: options?.model || "gemini-pro",
        });

        const chat = model.startChat({
            history: messages.slice(0, -1).map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            })),
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;

        return {
            content: response.text(),
            usage: {
                promptTokens: 0, // Gemini doesn't provide token counts
                completionTokens: 0,
                totalTokens: 0,
            },
            model: options?.model || "gemini-pro",
            provider: "google",
        };
    }

    async validateKey(apiKey: string): Promise<boolean> {
        try {
            const client = new GoogleGenerativeAI(apiKey);
            const model = client.getGenerativeModel({ model: "gemini-pro" });
            await model.generateContent("test");
            return true;
        } catch {
            return false;
        }
    }

    estimateCost(tokens: number, model: string): number {
        const pricing: Record<string, { input: number; output: number }> = {
            "gemini-pro": { input: 0.00025, output: 0.0005 },
            "gemini-pro-vision": { input: 0.00025, output: 0.0005 },
        };

        const rates = pricing[model] || pricing["gemini-pro"];
        return (tokens / 1000) * rates.input;
    }
}
