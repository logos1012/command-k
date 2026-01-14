export interface AIProvider {
    processText(selectedText: string, prompt: string): Promise<string>;
    validateSettings(): boolean;
    getMaxTokens(): number;
}

export abstract class BaseAIProvider implements AIProvider {
    protected maxTokens: number;

    constructor(maxTokens: number = 7000) {
        this.maxTokens = Math.min(maxTokens, 7000); // Enforce 7000 token limit
    }

    abstract processText(selectedText: string, prompt: string): Promise<string>;
    abstract validateSettings(): boolean;

    getMaxTokens(): number {
        return this.maxTokens;
    }

    protected estimateTokenCount(text: string): number {
        // Rough estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    protected validateTokenLimit(text: string): boolean {
        return this.estimateTokenCount(text) <= this.maxTokens;
    }
}