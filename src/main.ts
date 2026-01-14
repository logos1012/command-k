import {
    App,
    Plugin,
    PluginSettingTab,
    Notice,
    Editor,
    MarkdownView,
} from 'obsidian';

import { CmdKSettings, DEFAULT_SETTINGS } from './types';
import { CmdKSettingTab } from './settings';
import { PromptModal } from './ui/prompt-modal';
import { DiffViewer } from './ui/diff-viewer';
import { OpenAIProvider } from './ai/openai';
import { GeminiProvider } from './ai/gemini';
import { ClaudeProvider } from './ai/claude';
import { AIProvider } from './ai/provider';

export default class CmdKPlugin extends Plugin {
    settings: CmdKSettings;
    private ribbonIcon: HTMLElement | null = null;

    async onload() {
        await this.loadSettings();

        // Load CSS
        this.loadStyles();

        // Add ribbon icon
        this.ribbonIcon = this.addRibbonIcon(
            'wand-2',
            'CMD-K: Edit with AI',
            (evt: MouseEvent) => {
                this.handleCmdK();
            }
        );

        // Add command to command palette
        this.addCommand({
            id: 'cmd-k-edit',
            name: 'Edit selected text with AI',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                this.handleCmdKFromEditor(editor);
            },
            hotkeys: [
                {
                    modifiers: ['Mod'],
                    key: 'k',
                },
            ],
        });

        // Add settings tab
        this.addSettingTab(new CmdKSettingTab(this.app, this));
    }

    onunload() {
        // Clean up if needed
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private loadStyles() {
        // Load the CSS file content
        const styleEl = document.createElement('style');
        styleEl.id = 'cmd-k-styles';
        styleEl.textContent = `
            /* CMD-K Plugin Styles */

            /* Prompt Modal Styles */
            .cmd-k-preview {
                margin-bottom: 1rem;
            }

            .cmd-k-selected-text {
                background-color: var(--background-secondary);
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.9em;
                max-height: 150px;
                overflow-y: auto;
                white-space: pre-wrap;
                word-break: break-word;
            }

            .cmd-k-prompt {
                margin-bottom: 1rem;
            }

            .cmd-k-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            /* Diff Viewer Styles */
            .cmd-k-diff-container {
                margin: 1rem 0;
            }

            .cmd-k-diff-display {
                background-color: var(--background-secondary);
                padding: 1rem;
                border-radius: 4px;
                font-family: var(--font-monospace);
                font-size: 0.9em;
                max-height: 400px;
                overflow-y: auto;
                white-space: pre-wrap;
                word-break: break-word;
                line-height: 1.5;
            }

            .cmd-k-diff-added {
                background-color: rgba(0, 255, 0, 0.2);
                color: var(--text-success);
                text-decoration: none;
            }

            .cmd-k-diff-removed {
                background-color: rgba(255, 0, 0, 0.2);
                color: var(--text-error);
                text-decoration: line-through;
            }

            .cmd-k-diff-unchanged {
                color: var(--text-normal);
            }

            .cmd-k-diff-stats {
                margin-top: 0.5rem;
                color: var(--text-muted);
                text-align: center;
            }

            /* Loading indicator */
            .cmd-k-loading {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 2rem;
            }

            .cmd-k-loading-spinner {
                border: 3px solid var(--background-modifier-border);
                border-top: 3px solid var(--interactive-accent);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: cmd-k-spin 1s linear infinite;
            }

            @keyframes cmd-k-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Error styles */
            .cmd-k-error {
                background-color: var(--background-modifier-error);
                color: var(--text-error);
                padding: 0.5rem;
                border-radius: 4px;
                margin: 0.5rem 0;
            }
        `;
        document.head.appendChild(styleEl);
    }

    private handleCmdK() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            const editor = view.editor;
            this.handleCmdKFromEditor(editor);
        } else {
            new Notice('Please open a note and select some text first');
        }
    }

    private handleCmdKFromEditor(editor: Editor) {
        const selectedText = editor.getSelection();

        if (!selectedText) {
            new Notice('Please select some text first');
            return;
        }

        // Open prompt modal
        new PromptModal(
            this.app,
            selectedText,
            async (prompt: string) => {
                await this.processTextWithAI(editor, selectedText, prompt);
            }
        ).open();
    }

    private async processTextWithAI(editor: Editor, selectedText: string, prompt: string) {
        try {
            // Show loading notice
            const loadingNotice = new Notice('Processing with AI...', 0);

            // Get the appropriate AI provider
            const provider = this.getAIProvider();

            if (!provider.validateSettings()) {
                loadingNotice.hide();
                new Notice('Please configure your AI API key in settings');
                return;
            }

            // Process text with AI
            const modifiedText = await provider.processText(selectedText, prompt);

            loadingNotice.hide();

            // Show diff viewer
            new DiffViewer(
                this.app,
                selectedText,
                modifiedText,
                () => {
                    // Accept changes
                    editor.replaceSelection(modifiedText);
                    new Notice('Changes applied');
                },
                () => {
                    // Reject changes
                    new Notice('Changes rejected');
                }
            ).open();

        } catch (error) {
            console.error('Error processing text with AI:', error);
            new Notice(`Error: ${error instanceof Error ? error.message : 'Failed to process text'}`);
        }
    }

    private getAIProvider(): AIProvider {
        switch (this.settings.aiProvider) {
            case 'openai':
                return new OpenAIProvider(
                    this.settings.openaiApiKey,
                    this.settings.openaiModel,
                    this.settings.maxTokens
                );
            case 'gemini':
                return new GeminiProvider(
                    this.settings.geminiApiKey,
                    this.settings.geminiModel,
                    this.settings.maxTokens
                );
            case 'claude':
                return new ClaudeProvider(
                    this.settings.claudeApiKey,
                    this.settings.claudeModel,
                    this.settings.maxTokens
                );
            default:
                throw new Error(`Unknown AI provider: ${this.settings.aiProvider}`);
        }
    }
}