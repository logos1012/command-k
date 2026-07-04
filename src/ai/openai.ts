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

        if (this.isResponsesAPIModel(this.model)) {
            return this.processTextWithResponsesAPI(systemPrompt, userContent);
        }

        return this.processTextWithChatCompletions(systemPrompt, userContent);
    }

    private isResponsesAPIModel(model: string): boolean {
        return model.startsWith('gpt-5')
            || model.startsWith('gpt-4.1')
            || model.startsWith('o3')
            || model.startsWith('o4');
    }

    private async processTextWithChatCompletions(systemPrompt: string, userContent: string): Promise<string> {
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

    private async processTextWithResponsesAPI(systemPrompt: string, userContent: string): Promise<string> {
        try {
            const response = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    instructions: systemPrompt,
                    input: userContent,
                    max_output_tokens: this.maxTokens,
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const text = this.extractResponsesText(data);

            if (!text) {
                throw new Error('OpenAI API returned an empty response');
            }

            return text.trim();
        } catch (error) {
            console.error('OpenAI Responses API Error:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to process text with OpenAI');
        }
    }

    private extractResponsesText(data: any): string {
        if (typeof data.output_text === 'string') {
            return data.output_text;
        }

        let text = '';
        if (Array.isArray(data.output)) {
            for (const item of data.output) {
                if (item.type === 'message' && Array.isArray(item.content)) {
                    for (const contentItem of item.content) {
                        if (contentItem.type === 'output_text' && typeof contentItem.text === 'string') {
                            text += contentItem.text;
                        }
                    }
                }
            }
        }

        return text;
    }

    validateSettings(): boolean {
        return !!this.apiKey && this.apiKey.trim() !== '';
    }
}
