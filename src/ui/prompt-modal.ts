import { App, Modal, TextAreaComponent, ButtonComponent, Setting } from 'obsidian';

export class PromptModal extends Modal {
    private prompt: string = '';
    private onSubmit: (prompt: string) => void;
    private selectedText: string;

    constructor(app: App, selectedText: string, onSubmit: (prompt: string) => void) {
        super(app);
        this.selectedText = selectedText;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: 'CMD-K: AI Text Editor' });

        // Show selected text preview (truncated if too long)
        const previewDiv = contentEl.createDiv({ cls: 'cmd-k-preview' });
        previewDiv.createEl('h4', { text: 'Selected Text:' });
        const textPreview = this.selectedText.length > 200
            ? this.selectedText.substring(0, 200) + '...'
            : this.selectedText;
        previewDiv.createEl('pre', {
            text: textPreview,
            cls: 'cmd-k-selected-text'
        });

        // Prompt input area
        const promptDiv = contentEl.createDiv({ cls: 'cmd-k-prompt' });
        promptDiv.createEl('h4', { text: 'What would you like to do with this text?' });

        const textArea = new TextAreaComponent(promptDiv);
        textArea.inputEl.style.width = '100%';
        textArea.inputEl.style.minHeight = '100px';
        textArea.inputEl.placeholder = 'e.g., "Make it more concise", "Fix grammar", "Translate to Spanish"...';
        textArea.onChange(value => {
            this.prompt = value;
        });

        // Focus on the textarea when modal opens
        textArea.inputEl.focus();

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
        textArea.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.prompt.trim()) {
                    this.close();
                    this.onSubmit(this.prompt);
                }
            }
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}