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
            'EditorK: Edit with AI',
            (evt: MouseEvent) => {
                this.handleEditorK();
            }
        );

        // Add command to command palette
        this.addCommand({
            id: 'editor-k-edit',
            name: 'Edit selected text with AI',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                this.handleEditorKFromEditor(editor);
            },
            hotkeys: [
                {
                    modifiers: ['Ctrl', 'Shift'],
                    key: 'k',
                },
            ],
        });

        // Add alternative command with different shortcut
        this.addCommand({
            id: 'editor-k-edit-alt',
            name: 'Edit selected text with AI (Alternative)',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                this.handleEditorKFromEditor(editor);
            },
            hotkeys: [
                {
                    modifiers: ['Alt'],
                    key: 'e',
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
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);

        // Ensure savedPrompts and recentPrompts are arrays
        if (!Array.isArray(this.settings.savedPrompts)) {
            this.settings.savedPrompts = DEFAULT_SETTINGS.savedPrompts;
        }
        if (!Array.isArray(this.settings.recentPrompts)) {
            this.settings.recentPrompts = [];
        }
        if (!this.settings.maxRecentPrompts) {
            this.settings.maxRecentPrompts = 5;
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private loadStyles() {
        // Load the CSS file content
        const styleEl = document.createElement('style');
        styleEl.id = 'editor-k-styles';
        styleEl.textContent = `
            /* EditorK Plugin Styles */

            /* Modal Layout */
            .editor-k-prompt-modal {
                width: 800px !important;
                max-width: 90vw !important;
            }

            .modal:has(.editor-k-prompt-modal) {
                width: 800px !important;
                max-width: 90vw !important;
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) !important;
            }

            .modal-container:has(.editor-k-prompt-modal) {
                width: 800px !important;
                max-width: 90vw !important;
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) !important;
            }

            .editor-k-main-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 1rem;
            }

            .editor-k-top-section {
                width: 100%;
            }

            .editor-k-bottom-section {
                width: 100%;
                border-top: 1px solid var(--background-modifier-border);
                padding-top: 20px;
                max-height: 300px;
                overflow-y: auto;
            }

            /* Save Prompt Section */
            .editor-k-save-prompt {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--background-modifier-border);
            }

            .editor-k-save-hint {
                font-size: 0.9em;
                color: var(--text-muted);
                margin-bottom: 0.5rem;
            }

            .editor-k-save-container {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: nowrap;
            }

            .editor-k-save-container input[type="text"] {
                box-sizing: border-box;
            }

            /* Prompt List */
            .editor-k-prompt-list {
                margin-top: 0.5rem;
            }

            .editor-k-category {
                margin-bottom: 1.5rem;
            }

            .editor-k-category-title {
                color: var(--text-muted);
                font-size: 0.9em;
                margin: 0 0 0.75rem 0;
                font-weight: 600;
            }

            .editor-k-category-items {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .editor-k-prompt-item {
                background: var(--background-secondary);
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: background 0.2s;
                cursor: pointer;
                flex-shrink: 0;
            }

            .editor-k-prompt-item:hover {
                background: var(--background-secondary-alt);
            }

            .editor-k-prompt-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .editor-k-prompt-name {
                font-weight: 500;
                color: var(--text-normal);
                white-space: nowrap;
            }

            .editor-k-usage-count {
                font-size: 0.75em;
                color: var(--text-faint);
                white-space: nowrap;
            }

            .editor-k-prompt-buttons {
                display: flex;
                gap: 4px;
                align-items: center;
            }

            .editor-k-delete-btn {
                background: transparent !important;
                color: var(--text-error) !important;
                font-size: 1.2em !important;
                padding: 0 8px !important;
                min-width: auto !important;
            }

            .editor-k-no-prompts {
                color: var(--text-muted);
                font-style: italic;
                text-align: center;
                padding: 1rem;
            }

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
                overflow-x: hidden;
            }

            .cmd-k-prompt {
                margin-bottom: 1rem;
            }

            .cmd-k-prompt textarea {
                width: 100% !important;
                min-height: 100px !important;
                resize: vertical;
                box-sizing: border-box;
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

    private handleEditorK() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            const editor = view.editor;
            this.handleEditorKFromEditor(editor);
        } else {
            new Notice('Please open a note and select some text first');
        }
    }

    private handleEditorKFromEditor(editor: Editor) {
        const selectedText = editor.getSelection();

        if (!selectedText) {
            new Notice('Please select some text first');
            return;
        }

        // Open prompt modal with saved prompts support
        const modal = new PromptModal(
            this.app,
            selectedText,
            this.settings.savedPrompts || [],
            async (prompt: string) => {
                // Update recent prompts
                if (!this.settings.recentPrompts.includes(prompt)) {
                    this.settings.recentPrompts.unshift(prompt);
                    if (this.settings.recentPrompts.length > this.settings.maxRecentPrompts) {
                        this.settings.recentPrompts.pop();
                    }
                    await this.saveSettings();
                }

                // Update usage count for matching saved prompt
                const savedPrompt = this.settings.savedPrompts.find(p => p.prompt === prompt);
                if (savedPrompt) {
                    savedPrompt.usageCount++;
                    await this.saveSettings();
                }

                await this.processTextWithAI(editor, selectedText, prompt);
            },
            async (newPrompt) => {
                // Save to settings (modal already added to its local list)
                await this.saveSettings();
                new Notice(`Prompt "${newPrompt.name}" saved!`);
            },
            async (promptId) => {
                // Delete prompt
                this.settings.savedPrompts = this.settings.savedPrompts.filter(p => p.id !== promptId);
                await this.saveSettings();
                new Notice('Prompt deleted');
            }
        );
        modal.open();
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