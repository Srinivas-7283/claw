// AI Provider Interface - Unified abstraction for multiple AI providers

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface AIResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
    provider: string;
}

export interface AIOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface AIProvider {
    name: string;
    call(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>;
    validateKey(apiKey: string): Promise<boolean>;
    estimateCost(tokens: number, model: string): number;
}
