export const PRICING_PER_MILLION_TOKENS = {
    openai: {
        'gpt-5.5': { input: 5.00, output: 30.00 },
        'gpt-5.5-pro': { input: 30.00, output: 180.00 },
        'gpt-5.4': { input: 2.50, output: 15.00 },
        'gpt-5.4-mini': { input: 0.75, output: 4.50 },
        'gpt-5.4-nano': { input: 0.20, output: 1.25 },
        'gpt-5.4-pro': { input: 30.00, output: 180.00 },
        'gpt-5.2': { input: 1.75, output: 14.00 },
        'gpt-5.2-pro': { input: 21.00, output: 168.00 },
        'gpt-5.1': { input: 1.25, output: 10.00 },
        'gpt-5': { input: 1.25, output: 10.00 },
        'gpt-5-mini': { input: 0.25, output: 2.00 },
        'gpt-5-nano': { input: 0.05, output: 0.40 },
        'gpt-5-pro': { input: 15.00, output: 120.00 },
        'gpt-4.1': { input: 3.00, output: 12.00 },
        'gpt-4.1-mini': { input: 0.80, output: 3.20 },
        'gpt-4.1-nano': { input: 0.20, output: 0.80 },
        'gpt-4o': { input: 2.5, output: 10 },
        'gpt-4o-mini': { input: 0.15, output: 0.6 },
        'o3': { input: 2.00, output: 8.00 },
        'o3-pro': { input: 20.00, output: 80.00 },
        'o4-mini': { input: 4.00, output: 16.00 },
        'o1': { input: 15.00, output: 60.00 },
        'o1-pro': { input: 150.00, output: 600.00 },
        'o1-mini': { input: 1.10, output: 4.40 },
    },
    gemini: {
        'gemini-3.5-flash': { input: 2.70, output: 16.20 },
        'gemini-3.1-pro-preview': { input: 2.00, output: 12.00 },
        'gemini-3.1-flash-lite': { input: 0.25, output: 1.50 },
        'gemini-3-flash-preview': { input: 0.50, output: 3.00 },
        'gemini-2.5-pro': { input: 1.25, output: 10.00 },
        'gemini-2.5-flash': { input: 0.30, output: 2.50 },
        'gemini-2.5-flash-lite': { input: 0.10, output: 0.40 },
    },
    claude: {
        'claude-fable-5': { input: 10.00, output: 50.00 },
        'claude-mythos-5': { input: 10.00, output: 50.00 },
        'claude-mythos-preview': { input: 10.00, output: 50.00 },
        'claude-opus-4-8': { input: 5.00, output: 25.00 },
        'claude-sonnet-5': { input: 2.00, output: 10.00 },
        'claude-haiku-4-5-20251001': { input: 1.00, output: 5.00 },
        'claude-haiku-4-5': { input: 1.00, output: 5.00 },
        'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
        'claude-opus-4-7': { input: 5.00, output: 25.00 },
        'claude-opus-4-6': { input: 5.00, output: 25.00 },
        'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
        'claude-3-opus-20240229': { input: 15, output: 75 },
        'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    }
} as const;

export type OpenAIModel = keyof typeof PRICING_PER_MILLION_TOKENS.openai;
export type GeminiModel = keyof typeof PRICING_PER_MILLION_TOKENS.gemini;
export type ClaudeModel = keyof typeof PRICING_PER_MILLION_TOKENS.claude;
export type AIProvider = 'openai' | 'gemini' | 'claude';

export const OPENAI_MODELS = Object.keys(PRICING_PER_MILLION_TOKENS.openai) as OpenAIModel[];
export const GEMINI_MODELS = Object.keys(PRICING_PER_MILLION_TOKENS.gemini) as GeminiModel[];
export const CLAUDE_MODELS = Object.keys(PRICING_PER_MILLION_TOKENS.claude) as ClaudeModel[];

export interface SavedPrompt {
    id: string;
    name: string;
    prompt: string;
    category?: string;
    createdAt: number;
    usageCount: number;
}

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

    // Prompt settings
    savedPrompts: SavedPrompt[];
    recentPrompts: string[];
    maxRecentPrompts: number;
}

export const DEFAULT_SETTINGS: CmdKSettings = {
    aiProvider: 'openai',
    openaiApiKey: '',
    openaiModel: 'gpt-5.5',
    geminiApiKey: '',
    geminiModel: 'gemini-3.5-flash',
    claudeApiKey: '',
    claudeModel: 'claude-sonnet-5',
    maxTokens: 7000,
    savedPrompts: [
        {
            id: '1',
            name: 'Fix Grammar',
            prompt: 'Fix grammar and spelling errors',
            category: 'Writing',
            createdAt: Date.now(),
            usageCount: 0
        },
        {
            id: '2',
            name: 'Make Concise',
            prompt: 'Make this text more concise while keeping the main points',
            category: 'Writing',
            createdAt: Date.now(),
            usageCount: 0
        },
        {
            id: '3',
            name: 'Translate to Korean',
            prompt: 'Translate this text to Korean',
            category: 'Translation',
            createdAt: Date.now(),
            usageCount: 0
        }
    ],
    recentPrompts: [],
    maxRecentPrompts: 5,
};

export interface AIRequest {
    selectedText: string;
    prompt: string;
}

export interface AIResponse {
    modifiedText: string;
    error?: string;
}
