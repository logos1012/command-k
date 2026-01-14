import { BaseAIProvider } from './provider';
import { ClaudeModel } from '../types';

export class ClaudeProvider extends BaseAIProvider {
    private apiKey: string;
    private model: ClaudeModel;

    constructor(apiKey: string, model: ClaudeModel, maxTokens: number) {
        super(maxTokens);
        this.apiKey = apiKey;
        this.model = model;
    }

    async processText(selectedText: string, prompt: string): Promise<string> {
        if (!this.validateSettings()) {
            throw new Error('Claude API key is not configured');
        }

        if (!this.validateTokenLimit(selectedText + prompt)) {
            throw new Error(`Text exceeds maximum token limit of ${this.maxTokens}`);
        }

        const systemPrompt = `You are an AI assistant helping to edit text.
        You will receive a selected text and a user prompt.
        Your task is to modify the selected text according to the user's instructions.
        Return ONLY the modified text without any explanations or additional formatting.`;

        const userContent = `Selected Text:\n${selectedText}\n\nUser Request: ${prompt}`;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: this.maxTokens,
                    messages: [
                        {
                            role: 'user',
                            content: userContent
                        }
                    ],
                    system: systemPrompt,
                    temperature: 0.7,
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Claude API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const modifiedText = data.content[0].text.trim();

            return modifiedText;
        } catch (error) {
            console.error('Claude API Error:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to process text with Claude');
        }
    }

    validateSettings(): boolean {
        return !!this.apiKey && this.apiKey.trim() !== '';
    }
}