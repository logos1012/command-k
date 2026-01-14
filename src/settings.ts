import { App, PluginSettingTab, Setting } from 'obsidian';
import CmdKPlugin from './main';
import { PRICING_PER_MILLION_TOKENS } from './types';

type OpenAIModel = keyof typeof PRICING_PER_MILLION_TOKENS.openai;
type GeminiModel = keyof typeof PRICING_PER_MILLION_TOKENS.gemini;
type ClaudeModel = keyof typeof PRICING_PER_MILLION_TOKENS.claude;

function formatCost(input: number, output: number): string {
    return `$${input}/$${output} per 1M tokens`;
}

function getOpenAIModelLabel(model: OpenAIModel): string {
    const pricing = PRICING_PER_MILLION_TOKENS.openai[model];
    const labels: Record<OpenAIModel, string> = {
        'gpt-5.2': 'GPT-5.2',
        'gpt-5.2-pro': 'GPT-5.2 Pro',
        'gpt-5.1': 'GPT-5.1',
        'gpt-5': 'GPT-5',
        'gpt-5-mini': 'GPT-5 Mini',
        'gpt-5-nano': 'GPT-5 Nano',
        'gpt-5-pro': 'GPT-5 Pro',
        'gpt-4.1': 'GPT-4.1',
        'gpt-4.1-mini': 'GPT-4.1 Mini',
        'gpt-4.1-nano': 'GPT-4.1 Nano',
        'gpt-4o': 'GPT-4o',
        'gpt-4o-mini': 'GPT-4o Mini',
        'o3': 'o3',
        'o3-pro': 'o3 Pro',
        'o4-mini': 'o4 Mini',
        'o1': 'o1',
        'o1-pro': 'o1 Pro',
        'o1-mini': 'o1 Mini',
    };
    return `${labels[model]} (${formatCost(pricing.input, pricing.output)})`;
}

function getGeminiModelLabel(model: GeminiModel): string {
    const pricing = PRICING_PER_MILLION_TOKENS.gemini[model];
    const labels: Record<GeminiModel, string> = {
        'gemini-1.5-flash': 'Gemini 1.5 Flash',
        'gemini-1.5-pro': 'Gemini 1.5 Pro',
        'gemini-2.0-flash': 'Gemini 2.0 Flash',
    };
    return `${labels[model]} (${formatCost(pricing.input, pricing.output)})`;
}

function getClaudeModelLabel(model: ClaudeModel): string {
    const pricing = PRICING_PER_MILLION_TOKENS.claude[model];
    const labels: Record<ClaudeModel, string> = {
        'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
        'claude-3-opus-20240229': 'Claude 3 Opus',
        'claude-3-haiku-20240307': 'Claude 3 Haiku',
    };
    return `${labels[model]} (${formatCost(pricing.input, pricing.output)})`;
}

export class CmdKSettingTab extends PluginSettingTab {
    plugin: CmdKPlugin;

    constructor(app: App, plugin: CmdKPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'CMD-K Settings' });

        // AI Provider Selection
        new Setting(containerEl)
            .setName('AI Provider')
            .setDesc('Select the AI provider to use for text editing')
            .addDropdown(dropdown => dropdown
                .addOption('openai', 'OpenAI (ChatGPT)')
                .addOption('gemini', 'Google Gemini')
                .addOption('claude', 'Anthropic Claude')
                .setValue(this.plugin.settings.aiProvider)
                .onChange(async (value: 'openai' | 'gemini' | 'claude') => {
                    this.plugin.settings.aiProvider = value;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        // OpenAI Settings
        if (this.plugin.settings.aiProvider === 'openai') {
            containerEl.createEl('h3', { text: 'OpenAI Settings' });

            new Setting(containerEl)
                .setName('OpenAI API Key')
                .setDesc('Your OpenAI API key')
                .addText(text => text
                    .setPlaceholder('sk-...')
                    .setValue(this.plugin.settings.openaiApiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.openaiApiKey = value;
                        await this.plugin.saveSettings();
                    })
                    .inputEl.type = 'password');

            new Setting(containerEl)
                .setName('OpenAI Model')
                .setDesc('Model for text editing. Cost shown as input/output per 1M tokens.')
                .addDropdown(dropdown => {
                    const models: OpenAIModel[] = [
                        'gpt-5.2', 'gpt-5.2-pro', 'gpt-5.1', 'gpt-5', 'gpt-5-mini',
                        'gpt-5-nano', 'gpt-5-pro', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
                        'gpt-4o', 'gpt-4o-mini', 'o3', 'o3-pro', 'o4-mini',
                        'o1', 'o1-pro', 'o1-mini'
                    ];
                    models.forEach(model => {
                        dropdown.addOption(model, getOpenAIModelLabel(model));
                    });
                    dropdown.setValue(this.plugin.settings.openaiModel)
                        .onChange(async (value) => {
                            this.plugin.settings.openaiModel = value as OpenAIModel;
                            await this.plugin.saveSettings();
                        });
                });
        }

        // Gemini Settings
        if (this.plugin.settings.aiProvider === 'gemini') {
            containerEl.createEl('h3', { text: 'Google Gemini Settings' });

            new Setting(containerEl)
                .setName('Gemini API Key')
                .setDesc('Your Google Gemini API key')
                .addText(text => text
                    .setPlaceholder('API key')
                    .setValue(this.plugin.settings.geminiApiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.geminiApiKey = value;
                        await this.plugin.saveSettings();
                    })
                    .inputEl.type = 'password');

            new Setting(containerEl)
                .setName('Gemini Model')
                .setDesc('Model for text editing. Cost shown as input/output per 1M tokens.')
                .addDropdown(dropdown => {
                    const models: GeminiModel[] = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
                    models.forEach(model => {
                        dropdown.addOption(model, getGeminiModelLabel(model));
                    });
                    dropdown.setValue(this.plugin.settings.geminiModel)
                        .onChange(async (value) => {
                            this.plugin.settings.geminiModel = value as GeminiModel;
                            await this.plugin.saveSettings();
                        });
                });
        }

        // Claude Settings
        if (this.plugin.settings.aiProvider === 'claude') {
            containerEl.createEl('h3', { text: 'Anthropic Claude Settings' });

            new Setting(containerEl)
                .setName('Claude API Key')
                .setDesc('Your Anthropic Claude API key')
                .addText(text => text
                    .setPlaceholder('sk-ant-...')
                    .setValue(this.plugin.settings.claudeApiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.claudeApiKey = value;
                        await this.plugin.saveSettings();
                    })
                    .inputEl.type = 'password');

            new Setting(containerEl)
                .setName('Claude Model')
                .setDesc('Model for text editing. Cost shown as input/output per 1M tokens.')
                .addDropdown(dropdown => {
                    const models: ClaudeModel[] = [
                        'claude-3-5-sonnet-20241022',
                        'claude-3-opus-20240229',
                        'claude-3-haiku-20240307'
                    ];
                    models.forEach(model => {
                        dropdown.addOption(model, getClaudeModelLabel(model));
                    });
                    dropdown.setValue(this.plugin.settings.claudeModel)
                        .onChange(async (value) => {
                            this.plugin.settings.claudeModel = value as ClaudeModel;
                            await this.plugin.saveSettings();
                        });
                });
        }

        // General Settings
        containerEl.createEl('h3', { text: 'General Settings' });

        new Setting(containerEl)
            .setName('Max Tokens')
            .setDesc('Maximum number of tokens for AI processing (max: 7000)')
            .addText(text => text
                .setPlaceholder('7000')
                .setValue(String(this.plugin.settings.maxTokens))
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue > 0) {
                        this.plugin.settings.maxTokens = Math.min(numValue, 7000);
                        await this.plugin.saveSettings();
                    }
                }));

        // Keyboard Shortcut Info
        containerEl.createEl('h3', { text: 'Keyboard Shortcuts' });
        const shortcutInfo = containerEl.createDiv();
        shortcutInfo.createEl('p', {
            text: 'Default shortcut: Cmd/Ctrl + K (when text is selected)'
        });
        shortcutInfo.createEl('p', {
            text: 'You can customize this in Settings → Hotkeys → Search for "CMD-K"'
        });
    }
}