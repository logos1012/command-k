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
        const { contentEl, modalEl } = this;

        // Add custom class for CSS targeting - let Obsidian handle positioning
        contentEl.addClass('editor-k-prompt-modal');
        if (modalEl) {
            modalEl.addClass('editor-k-modal');
        }

        contentEl.createEl('h2', { text: 'EditorK: AI Text Editor' });

        // Create main container with vertical layout
        const mainContainer = contentEl.createDiv({ cls: 'editor-k-main-container' });

        // Top section: Input area
        const topSection = mainContainer.createDiv({ cls: 'editor-k-top-section' });

        // Show selected text preview
        const previewDiv = topSection.createDiv({ cls: 'cmd-k-preview' });
        previewDiv.createEl('h4', { text: 'Selected Text:' });
        const textPreview = this.selectedText.length > 200
            ? this.selectedText.substring(0, 200) + '...'
            : this.selectedText;
        previewDiv.createEl('pre', {
            text: textPreview,
            cls: 'cmd-k-selected-text'
        });

        // Prompt input area
        const promptDiv = topSection.createDiv({ cls: 'cmd-k-prompt' });
        promptDiv.createEl('h4', { text: 'What would you like to do?' });

        this.textArea = new TextAreaComponent(promptDiv);
        this.textArea.inputEl.style.width = '100%';
        this.textArea.inputEl.style.minHeight = '100px';
        this.textArea.inputEl.placeholder = 'e.g., "Make it more concise", "Fix grammar", "Translate to Spanish"...';
        this.textArea.onChange(value => {
            this.prompt = value;
        });

        // Save prompt section
        const savePromptDiv = topSection.createDiv({ cls: 'editor-k-save-prompt' });
        savePromptDiv.createEl('p', {
            text: 'Save current prompt for quick access later',
            cls: 'editor-k-save-hint'
        });

        const savePromptContainer = savePromptDiv.createDiv({ cls: 'editor-k-save-container' });

        const promptNameInput = new TextComponent(savePromptContainer);
        promptNameInput.setPlaceholder('Prompt name (e.g., Fix Grammar)');
        promptNameInput.inputEl.style.flex = '1';
        promptNameInput.inputEl.style.marginRight = '8px';

        const categoryInput = new TextComponent(savePromptContainer);
        categoryInput.setPlaceholder('Category (optional)');
        categoryInput.inputEl.style.width = '150px';
        categoryInput.inputEl.style.marginRight = '8px';

        const savePromptBtn = new ButtonComponent(savePromptContainer);
        savePromptBtn
            .setButtonText('Save')
            .onClick(async () => {
                if (this.prompt.trim() && promptNameInput.getValue().trim()) {
                    const newPrompt: SavedPrompt = {
                        id: Date.now().toString(),
                        name: promptNameInput.getValue(),
                        prompt: this.prompt,
                        category: categoryInput.getValue() || 'General',
                        createdAt: Date.now(),
                        usageCount: 0
                    };

                    // Add to local list immediately
                    this.savedPrompts.push(newPrompt);

                    // Save to settings
                    await this.onSavePrompt(newPrompt);

                    // Update the display
                    this.updatePromptList();

                    // Clear inputs
                    promptNameInput.setValue('');
                    categoryInput.setValue('');
                } else if (!this.prompt.trim()) {
                    alert('Please enter a prompt first!');
                } else {
                    alert('Please enter a prompt name!');
                }
            });

        // Focus on the textarea when modal opens
        this.textArea.inputEl.focus();

        // Bottom section: Saved prompts
        const bottomSection = mainContainer.createDiv({ cls: 'editor-k-bottom-section' });
        bottomSection.createEl('h4', { text: 'Saved Prompts' });

        this.promptListEl = bottomSection.createDiv({ cls: 'editor-k-prompt-list' });
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
                } else {
                    alert('Please enter a prompt!');
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

    public updatePromptList() {
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

            const categoryItems = categoryEl.createDiv({ cls: 'editor-k-category-items' });

            promptsByCategory[category].forEach(savedPrompt => {
                const promptItemEl = categoryItems.createDiv({ cls: 'editor-k-prompt-item' });

                // Make the whole item clickable to use the prompt
                promptItemEl.onclick = (e) => {
                    // Don't trigger if clicking on delete button
                    if (!(e.target as HTMLElement).closest('.editor-k-delete-btn')) {
                        this.textArea.setValue(savedPrompt.prompt);
                        this.prompt = savedPrompt.prompt;
                        this.textArea.inputEl.focus();
                    }
                };

                const promptContent = promptItemEl.createDiv({ cls: 'editor-k-prompt-content' });
                promptContent.createEl('span', {
                    text: savedPrompt.name,
                    cls: 'editor-k-prompt-name'
                });

                if (savedPrompt.usageCount > 0) {
                    promptContent.createEl('span', {
                        text: `(${savedPrompt.usageCount})`,
                        cls: 'editor-k-usage-count'
                    });
                }

                const buttonContainer = promptItemEl.createDiv({ cls: 'editor-k-prompt-buttons' });

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