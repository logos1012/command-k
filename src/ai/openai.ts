import { BaseAIProvider } from './provider';
import { OpenAIModel } from '../types';
import { Notice } from 'obsidian';

export class OpenAIProvider extends BaseAIProvider {
    private apiKey: string;
    private model: OpenAIModel;

    constructor(apiKey: string, model: OpenAIModel, maxTokens: number) {
        super(maxTokens);
        this.apiKey = apiKey;
        this.model = model;
    }

    async processText(selectedText: string, prompt: string): Promise<string> {
        if (!this.validateSettings()) {
            throw new Error('OpenAI API key is not configured');
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
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userContent }
                    ],
                    max_tokens: this.maxTokens,
                    temperature: 0.7,
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const modifiedText = data.choices[0].message.content.trim();

            return modifiedText;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to process text with OpenAI');
        }
    }

    validateSettings(): boolean {
        return !!this.apiKey && this.apiKey.trim() !== '';
    }
}