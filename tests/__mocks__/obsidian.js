// Mock for Obsidian API
module.exports = {
  Plugin: class Plugin {
    constructor() {}
    loadData() { return Promise.resolve({}); }
    saveData() { return Promise.resolve(); }
  },
  Modal: class Modal {
    constructor() {}
    open() {}
    close() {}
  },
  Notice: class Notice {
    constructor(message, timeout) {
      this.message = message;
      this.timeout = timeout;
    }
    hide() {}
  },
  Setting: class Setting {
    constructor(containerEl) {
      this.containerEl = containerEl;
    }
    setName() { return this; }
    setDesc() { return this; }
    addText() { return this; }
    addDropdown() { return this; }
    addTextArea() { return this; }
  },
  PluginSettingTab: class PluginSettingTab {
    constructor(app, plugin) {}
    display() {}
  },
  TextComponent: class TextComponent {
    setValue() { return this; }
    onChange() { return this; }
    setPlaceholder() { return this; }
  },
  TextAreaComponent: class TextAreaComponent {
    setValue() { return this; }
    onChange() { return this; }
    inputEl = { style: {} };
  },
  ButtonComponent: class ButtonComponent {
    setButtonText() { return this; }
    setCta() { return this; }
    setWarning() { return this; }
    onClick() { return this; }
  },
  DropdownComponent: class DropdownComponent {
    addOption() { return this; }
    setValue() { return this; }
    onChange() { return this; }
  },
  MarkdownView: class MarkdownView {
    editor = {
      getSelection: () => '',
      replaceSelection: () => {}
    }
  },
  Editor: class Editor {
    getSelection() { return ''; }
    replaceSelection() {}
  }
};