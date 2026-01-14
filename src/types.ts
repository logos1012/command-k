export const PRICING_PER_MILLION_TOKENS = {
    openai: {
        'gpt-5.2': { input: 15, output: 60 },
        'gpt-5.2-pro': { input: 30, output: 120 },
        'gpt-5.1': { input: 10, output: 40 },
        'gpt-5': { input: 8, output: 32 },
        'gpt-5-mini': { input: 2, output: 8 },
        'gpt-5-nano': { input: 0.5, output: 2 },
        'gpt-5-pro': { input: 20, output: 80 },
        'gpt-4.1': { input: 5, output: 20 },
        'gpt-4.1-mini': { input: 1, output: 4 },
        'gpt-4.1-nano': { input: 0.3, output: 1.2 },
        'gpt-4o': { input: 2.5, output: 10 },
        'gpt-4o-mini': { input: 0.15, output: 0.6 },
        'o3': { input: 100, output: 400 },
        'o3-pro': { input: 200, output: 800 },
        'o4-mini': { input: 0.1, output: 0.4 },
        'o1': { input: 15, output: 60 },
        'o1-pro': { input: 30, output: 120 },
        'o1-mini': { input: 3, output: 12 },
    },
    gemini: {
        'gemini-1.5-flash': { input: 0.075, output: 0.3 },
        'gemini-1.5-pro': { input: 1.25, output: 5 },
        'gemini-2.0-flash': { input: 0.075, output: 0.3 },
    },
    claude: {
        'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
        'claude-3-opus-20240229': { input: 15, output: 75 },
        'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    }
} as const;

export type OpenAIModel = keyof typeof PRICING_PER_MILLION_TOKENS.openai;
export type GeminiModel = keyof typeof PRICING_PER_MILLION_TOKENS.gemini;
export type ClaudeModel = keyof typeof PRICING_PER_MILLION_TOKENS.claude;
export type AIProvider = 'openai' | 'gemini' | 'claude';

export interface CmdKSettings {
    aiProvider: AIProvider;

    // OpenAI settings
    openaiApiKey: string;
    openaiModel: OpenAIModel;

    // Gemini settings
    geminiApiKey: string;
    geminiModel: GeminiModel;

    // Claude settings
    claudeApiKey: string;
    claudeModel: ClaudeModel;

    // General settings
    maxTokens: number;
}

export const DEFAULT_SETTINGS: CmdKSettings = {
    aiProvider: 'openai',
    openaiApiKey: '',
    openaiModel: 'gpt-4o-mini',
    geminiApiKey: '',
    geminiModel: 'gemini-1.5-flash',
    claudeApiKey: '',
    claudeModel: 'claude-3-haiku-20240307',
    maxTokens: 7000,
};

export interface AIRequest {
    selectedText: string;
    prompt: string;
}

export interface AIResponse {
    modifiedText: string;
    error?: string;
}