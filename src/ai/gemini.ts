import { BaseAIProvider } from './provider';
import { GeminiModel } from '../types';

export class GeminiProvider extends BaseAIProvider {
    private apiKey: string;
    private model: GeminiModel;

    constructor(apiKey: string, model: GeminiModel, maxTokens: number) {
        super(maxTokens);
        this.apiKey = apiKey;
        this.model = model;
    }

    async processText(selectedText: string, prompt: string): Promise<string> {
        if (!this.validateSettings()) {
            throw new Error('Gemini API key is not configured');
        }

        if (!this.validateTokenLimit(selectedText + prompt)) {
            throw new Error(`Text exceeds maximum token limit of ${this.maxTokens}`);
        }

        const systemInstruction = `You are an AI assistant helping to edit text.
        You will receive a selected text and a user prompt.
        Your task is to modify the selected text according to the user's instructions.
        Return ONLY the modified text without any explanations or additional formatting.`;

        const userContent = `Selected Text:\n${selectedText}\n\nUser Request: ${prompt}`;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: `${systemInstruction}\n\n${userContent}` }
                                ]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: this.maxTokens,
                        },
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const modifiedText = data.candidates[0].content.parts[0].text.trim();

            return modifiedText;
        } catch (error) {
            console.error('Gemini API Error:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to process text with Gemini');
        }
    }

    validateSettings(): boolean {
        return !!this.apiKey && this.apiKey.trim() !== '';
    }
}