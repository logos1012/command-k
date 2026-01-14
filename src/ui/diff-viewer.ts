import { App, Modal, ButtonComponent } from 'obsidian';
import * as diff from 'diff';

export class DiffViewer extends Modal {
    private originalText: string;
    private modifiedText: string;
    private onAccept: () => void;
    private onReject: () => void;

    constructor(
        app: App,
        originalText: string,
        modifiedText: string,
        onAccept: () => void,
        onReject: () => void
    ) {
        super(app);
        this.originalText = originalText;
        this.modifiedText = modifiedText;
        this.onAccept = onAccept;
        this.onReject = onReject;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: 'Review Changes' });

        // Create diff display
        const diffContainer = contentEl.createDiv({ cls: 'cmd-k-diff-container' });

        // Calculate diff
        const changes = diff.diffWords(this.originalText, this.modifiedText);

        // Display diff with colors
        const diffDisplay = diffContainer.createDiv({ cls: 'cmd-k-diff-display' });

        changes.forEach(part => {
            const span = diffDisplay.createEl('span');

            if (part.added) {
                span.addClass('cmd-k-diff-added');
                span.textContent = part.value;
            } else if (part.removed) {
                span.addClass('cmd-k-diff-removed');
                span.textContent = part.value;
            } else {
                span.addClass('cmd-k-diff-unchanged');
                span.textContent = part.value;
            }
        });

        // Statistics
        const statsDiv = contentEl.createDiv({ cls: 'cmd-k-diff-stats' });
        const addedChars = changes.filter(c => c.added).reduce((sum, c) => sum + (c.value?.length || 0), 0);
        const removedChars = changes.filter(c => c.removed).reduce((sum, c) => sum + (c.value?.length || 0), 0);
        statsDiv.createEl('small', {
            text: `Added: ${addedChars} characters | Removed: ${removedChars} characters`
        });

        // Buttons
        const buttonDiv = contentEl.createDiv({ cls: 'cmd-k-buttons' });

        const acceptButton = new ButtonComponent(buttonDiv);
        acceptButton
            .setButtonText('Accept')
            .setCta()
            .onClick(() => {
                this.close();
                this.onAccept();
            });

        const rejectButton = new ButtonComponent(buttonDiv);
        rejectButton
            .setButtonText('Reject')
            .setWarning()
            .onClick(() => {
                this.close();
                this.onReject();
            });

        // Keyboard shortcuts
        this.scope.register([], 'Enter', () => {
            this.close();
            this.onAccept();
            return false;
        });

        this.scope.register([], 'Escape', () => {
            this.close();
            this.onReject();
            return false;
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}