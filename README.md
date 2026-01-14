# EditorK for Obsidian

AI-powered text editing plugin for Obsidian, inspired by Cursor IDE's CMD+K feature.

## Features

- **AI-Powered Text Editing**: Select text in your notes and use AI to modify, enhance, or transform it
- **Multiple AI Providers**: Support for OpenAI (GPT), Google Gemini, and Anthropic Claude
- **Visual Diff View**: See changes with clear red/green highlighting before accepting
- **Simple Interface**: Just select text, press Cmd/Ctrl+K, and describe what you want

## Installation

### Via BRAT (Beta Reviewers Auto-update Tool)

1. Install BRAT plugin from Obsidian Community Plugins
2. In BRAT settings, click "Add Beta Plugin"
3. Enter this repository URL: `https://github.com/[your-username]/command-k`
4. Enable the CMD-K plugin in Obsidian settings

### Manual Installation

1. Download `main.js`, `manifest.json` from the latest release
2. Create a folder named `editor-k` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into the `cmd-k` folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community plugins

## Usage

1. **Configure AI Provider**: Go to Settings → EditorK and set up your preferred AI provider with API key
2. **Select Text**: Highlight any text in your note that you want to modify
3. **Activate**: Use one of these methods:
   - Press `Ctrl+Shift+K` (default shortcut)
   - Press `Alt+E` (alternative shortcut)
   - Click the wand icon in the ribbon
   - Use Command Palette: "EditorK: Edit selected text with AI"
4. **Enter Prompt**: Describe what you want to do with the selected text
5. **Review Changes**: See the diff view with additions in green and deletions in red
6. **Accept or Reject**: Click Accept to apply changes or Reject to cancel

## Configuration

### AI Providers

#### OpenAI
- Models: GPT-4o, GPT-4o-mini, and newer models
- Get API key from: https://platform.openai.com/api-keys

#### Google Gemini
- Models: Gemini 1.5 Flash, Gemini 1.5 Pro, Gemini 2.0 Flash
- Get API key from: https://makersuite.google.com/app/apikey

#### Anthropic Claude
- Models: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- Get API key from: https://console.anthropic.com/

### Settings

- **Max Tokens**: Set the maximum token limit (default: 7000, max: 7000)
- **AI Model**: Choose specific model for each provider with pricing information

## Examples

- "Make this more concise"
- "Fix grammar and spelling"
- "Translate to Spanish"
- "Convert to bullet points"
- "Make it more formal"
- "Add more details"
- "Explain this simply"

## Privacy & Security

- API keys are stored locally in your vault
- Only selected text is sent to AI providers
- No data is stored or logged by this plugin

## Support

For issues, feature requests, or contributions, visit: https://github.com/[your-username]/command-k

## License

MIT License - See LICENSE file for details