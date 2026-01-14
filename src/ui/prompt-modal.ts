import { App, Modal, TextAreaComponent, ButtonComponent, Setting, TextComponent } from 'obsidian';
import { SavedPrompt } from '../types';

export class PromptModal extends Modal {
    private prompt: string = '';
    private onSubmit: (prompt: string) => void;
    private selectedText: string;
    private savedPrompts: SavedPrompt[];
    private onSavePrompt: (prompt: SavedPrompt) => void;
    private onDeletePrompt: (id: string) => void;
    private textArea: TextAreaComponent;
    private promptListEl: HTMLElement;

    constructor(
        app: App,
        selectedText: string,
        savedPrompts: SavedPrompt[],
        onSubmit: (prompt: string) => void,
        onSavePrompt: (prompt: SavedPrompt) => void,
        onDeletePrompt: (id: string) => void
    ) {
        super(app);
        this.selectedText = selectedText;
        this.savedPrompts = savedPrompts;
        this.onSubmit = onSubmit;
        this.onSavePrompt = onSavePrompt;
        this.onDeletePrompt = onDeletePrompt;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('editor-k-prompt-modal');

        contentEl.createEl('h2', { text: 'EditorK: AI Text Editor' });

        // Create main container with two columns
        const mainContainer = contentEl.createDiv({ cls: 'editor-k-main-container' });

        // Left column: Input area
        const leftColumn = mainContainer.createDiv({ cls: 'editor-k-left-column' });

        // Show selected text preview
        const previewDiv = leftColumn.createDiv({ cls: 'cmd-k-preview' });
        previewDiv.createEl('h4', { text: 'Selected Text:' });
        const textPreview = this.selectedText.length > 200
            ? this.selectedText.substring(0, 200) + '...'
            : this.selectedText;
        previewDiv.createEl('pre', {
            text: textPreview,
            cls: 'cmd-k-selected-text'
        });

        // Prompt input area
        const promptDiv = leftColumn.createDiv({ cls: 'cmd-k-prompt' });
        promptDiv.createEl('h4', { text: 'What would you like to do?' });

        this.textArea = new TextAreaComponent(promptDiv);
        this.textArea.inputEl.style.width = '100%';
        this.textArea.inputEl.style.minHeight = '100px';
        this.textArea.inputEl.placeholder = 'e.g., "Make it more concise", "Fix grammar", "Translate to Spanish"...';
        this.textArea.onChange(value => {
            this.prompt = value;
        });

        // Save prompt button and input
        const savePromptDiv = leftColumn.createDiv({ cls: 'editor-k-save-prompt' });
        const savePromptContainer = savePromptDiv.createDiv({ cls: 'editor-k-save-container' });

        const promptNameInput = new TextComponent(savePromptContainer);
        promptNameInput.setPlaceholder('Prompt name...');
        promptNameInput.inputEl.style.marginRight = '8px';

        const categoryInput = new TextComponent(savePromptContainer);
        categoryInput.setPlaceholder('Category (optional)');
        categoryInput.inputEl.style.marginRight = '8px';

        const savePromptBtn = new ButtonComponent(savePromptContainer);
        savePromptBtn
            .setButtonText('Save Prompt')
            .onClick(() => {
                if (this.prompt.trim() && promptNameInput.getValue().trim()) {
                    const newPrompt: SavedPrompt = {
                        id: Date.now().toString(),
                        name: promptNameInput.getValue(),
                        prompt: this.prompt,
                        category: categoryInput.getValue() || 'General',
                        createdAt: Date.now(),
                        usageCount: 0
                    };
                    this.onSavePrompt(newPrompt);
                    this.updatePromptList();
                    promptNameInput.setValue('');
                    categoryInput.setValue('');
                }
            });

        // Focus on the textarea when modal opens
        this.textArea.inputEl.focus();

        // Right column: Saved prompts
        const rightColumn = mainContainer.createDiv({ cls: 'editor-k-right-column' });
        rightColumn.createEl('h4', { text: 'Saved Prompts' });

        this.promptListEl = rightColumn.createDiv({ cls: 'editor-k-prompt-list' });
        this.updatePromptList();

        // Submit and Cancel buttons
        const buttonDiv = contentEl.createDiv({ cls: 'cmd-k-buttons' });

        const submitButton = new ButtonComponent(buttonDiv);
        submitButton
            .setButtonText('Process')
            .setCta()
            .onClick(() => {
                if (this.prompt.trim()) {
                    this.close();
                    this.onSubmit(this.prompt);
                }
            });

        const cancelButton = new ButtonComponent(buttonDiv);
        cancelButton
            .setButtonText('Cancel')
            .onClick(() => {
                this.close();
            });

        // Handle Enter key for submission (Shift+Enter for new line)
        this.textArea.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && e.ctrlKey) {
                e.preventDefault();
                if (this.prompt.trim()) {
                    this.close();
                    this.onSubmit(this.prompt);
                }
            }
        });
    }

    private updatePromptList() {
        this.promptListEl.empty();

        // Group prompts by category
        const promptsByCategory: { [key: string]: SavedPrompt[] } = {};
        this.savedPrompts.forEach(prompt => {
            const category = prompt.category || 'General';
            if (!promptsByCategory[category]) {
                promptsByCategory[category] = [];
            }
            promptsByCategory[category].push(prompt);
        });

        // Sort prompts by usage count within each category
        Object.keys(promptsByCategory).forEach(category => {
            promptsByCategory[category].sort((a, b) => b.usageCount - a.usageCount);
        });

        // Display prompts by category
        Object.keys(promptsByCategory).sort().forEach(category => {
            const categoryEl = this.promptListEl.createDiv({ cls: 'editor-k-category' });
            categoryEl.createEl('h5', { text: category, cls: 'editor-k-category-title' });

            promptsByCategory[category].forEach(savedPrompt => {
                const promptItemEl = categoryEl.createDiv({ cls: 'editor-k-prompt-item' });

                const promptContent = promptItemEl.createDiv({ cls: 'editor-k-prompt-content' });
                promptContent.createEl('strong', { text: savedPrompt.name });
                promptContent.createEl('div', {
                    text: savedPrompt.prompt,
                    cls: 'editor-k-prompt-text'
                });

                if (savedPrompt.usageCount > 0) {
                    promptContent.createEl('small', {
                        text: `Used ${savedPrompt.usageCount} times`,
                        cls: 'editor-k-usage-count'
                    });
                }

                const buttonContainer = promptItemEl.createDiv({ cls: 'editor-k-prompt-buttons' });

                // Use button
                const useButton = new ButtonComponent(buttonContainer);
                useButton
                    .setButtonText('Use')
                    .setTooltip('Use this prompt')
                    .onClick(() => {
                        this.textArea.setValue(savedPrompt.prompt);
                        this.prompt = savedPrompt.prompt;
                        // Update usage count
                        savedPrompt.usageCount++;
                    });

                // Delete button
                const deleteButton = new ButtonComponent(buttonContainer);
                deleteButton
                    .setButtonText('×')
                    .setClass('editor-k-delete-btn')
                    .setTooltip('Delete this prompt')
                    .onClick(() => {
                        if (confirm(`Delete prompt "${savedPrompt.name}"?`)) {
                            this.onDeletePrompt(savedPrompt.id);
                            this.savedPrompts = this.savedPrompts.filter(p => p.id !== savedPrompt.id);
                            this.updatePromptList();
                        }
                    });
            });
        });

        if (this.savedPrompts.length === 0) {
            this.promptListEl.createEl('p', {
                text: 'No saved prompts yet. Save your frequently used prompts for quick access!',
                cls: 'editor-k-no-prompts'
            });
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}