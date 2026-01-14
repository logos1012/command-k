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
        previewDiv.createEl('h4', { text: '📄 선택된 텍스트:' });
        const textPreview = this.selectedText.length > 200
            ? this.selectedText.substring(0, 200) + '...'
            : this.selectedText;
        previewDiv.createEl('pre', {
            text: textPreview,
            cls: 'cmd-k-selected-text'
        });

        // Prompt input area
        const promptDiv = leftColumn.createDiv({ cls: 'cmd-k-prompt' });
        promptDiv.createEl('h4', { text: '✍️ 무엇을 하시겠습니까?' });

        this.textArea = new TextAreaComponent(promptDiv);
        this.textArea.inputEl.style.width = '100%';
        this.textArea.inputEl.style.minHeight = '100px';
        this.textArea.inputEl.placeholder = '예: "더 간결하게 만들어줘", "문법 교정", "한글로 번역"...';
        this.textArea.onChange(value => {
            this.prompt = value;
        });

        // Save prompt section
        const savePromptDiv = leftColumn.createDiv({ cls: 'editor-k-save-prompt' });
        savePromptDiv.createEl('p', {
            text: '💾 현재 프롬프트를 저장하려면 아래에 이름을 입력하세요',
            cls: 'editor-k-save-hint'
        });

        const savePromptContainer = savePromptDiv.createDiv({ cls: 'editor-k-save-container' });

        const promptNameInput = new TextComponent(savePromptContainer);
        promptNameInput.setPlaceholder('예: 문법 교정, 번역하기...');
        promptNameInput.inputEl.style.flex = '1';
        promptNameInput.inputEl.style.marginRight = '8px';

        const categoryInput = new TextComponent(savePromptContainer);
        categoryInput.setPlaceholder('카테고리 (선택)');
        categoryInput.inputEl.style.width = '150px';
        categoryInput.inputEl.style.marginRight = '8px';

        const savePromptBtn = new ButtonComponent(savePromptContainer);
        savePromptBtn
            .setButtonText('저장')
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
                    // Reload the saved prompts from settings
                    this.updatePromptList();
                    promptNameInput.setValue('');
                    categoryInput.setValue('');
                } else if (!this.prompt.trim()) {
                    alert('프롬프트를 먼저 입력하세요!');
                } else {
                    alert('프롬프트 이름을 입력하세요!');
                }
            });

        // Focus on the textarea when modal opens
        this.textArea.inputEl.focus();

        // Right column: Saved prompts
        const rightColumn = mainContainer.createDiv({ cls: 'editor-k-right-column' });
        rightColumn.createEl('h4', { text: '📚 저장된 프롬프트' });

        this.promptListEl = rightColumn.createDiv({ cls: 'editor-k-prompt-list' });
        this.updatePromptList();

        // Submit and Cancel buttons
        const buttonDiv = contentEl.createDiv({ cls: 'cmd-k-buttons' });

        const submitButton = new ButtonComponent(buttonDiv);
        submitButton
            .setButtonText('AI로 처리')
            .setCta()
            .onClick(() => {
                if (this.prompt.trim()) {
                    this.close();
                    this.onSubmit(this.prompt);
                } else {
                    alert('프롬프트를 입력하세요!');
                }
            });

        const cancelButton = new ButtonComponent(buttonDiv);
        cancelButton
            .setButtonText('취소')
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
                    .setButtonText('사용')
                    .setTooltip('이 프롬프트 사용하기')
                    .onClick(() => {
                        this.textArea.setValue(savedPrompt.prompt);
                        this.prompt = savedPrompt.prompt;
                        // Usage count will be updated when actually submitted
                    });

                // Delete button
                const deleteButton = new ButtonComponent(buttonContainer);
                deleteButton
                    .setButtonText('×')
                    .setClass('editor-k-delete-btn')
                    .setTooltip('이 프롬프트 삭제하기')
                    .onClick(() => {
                        if (confirm(`"${savedPrompt.name}" 프롬프트를 삭제하시겠습니까?`)) {
                            this.onDeletePrompt(savedPrompt.id);
                            this.savedPrompts = this.savedPrompts.filter(p => p.id !== savedPrompt.id);
                            this.updatePromptList();
                        }
                    });
            });
        });

        if (this.savedPrompts.length === 0) {
            this.promptListEl.createEl('p', {
                text: '아직 저장된 프롬프트가 없습니다. 자주 사용하는 프롬프트를 저장하면 빠르게 사용할 수 있습니다!',
                cls: 'editor-k-no-prompts'
            });
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}