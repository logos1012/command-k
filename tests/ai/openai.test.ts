import { OpenAIProvider } from '../../src/ai/openai';

// Mock fetch globally
global.fetch = jest.fn();

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  const mockApiKey = 'sk-test-key';
  const mockModel = 'gpt-4o-mini';

  beforeEach(() => {
    provider = new OpenAIProvider(mockApiKey, mockModel, 7000);
    jest.clearAllMocks();
  });

  describe('validateSettings', () => {
    it('should return true when API key is provided', () => {
      expect(provider.validateSettings()).toBe(true);
    });

    it('should return false when API key is empty', () => {
      const emptyProvider = new OpenAIProvider('', mockModel, 7000);
      expect(emptyProvider.validateSettings()).toBe(false);
    });

    it('should return false when API key is whitespace only', () => {
      const whitespaceProvider = new OpenAIProvider('   ', mockModel, 7000);
      expect(whitespaceProvider.validateSettings()).toBe(false);
    });
  });

  describe('processText', () => {
    const selectedText = 'Hello world';
    const prompt = 'Make it uppercase';

    it('should successfully process text with valid response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'HELLO WORLD'
          }
        }]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await provider.processText(selectedText, prompt);
      expect(result).toBe('HELLO WORLD');

      // Verify API call
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }),
          body: expect.stringContaining(mockModel)
        })
      );
    });

    it('should throw error when API key is not configured', async () => {
      const invalidProvider = new OpenAIProvider('', mockModel, 7000);

      await expect(
        invalidProvider.processText(selectedText, prompt)
      ).rejects.toThrow('OpenAI API key is not configured');
    });

    it('should throw error when text exceeds token limit', async () => {
      const longText = 'a'.repeat(30000);

      await expect(
        provider.processText(longText, prompt)
      ).rejects.toThrow('Text exceeds maximum token limit of 7000');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          error: {
            message: 'Invalid API key'
          }
        })
      });

      await expect(
        provider.processText(selectedText, prompt)
      ).rejects.toThrow('OpenAI API Error: Invalid API key');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        provider.processText(selectedText, prompt)
      ).rejects.toThrow('Network error');
    });
  });
});