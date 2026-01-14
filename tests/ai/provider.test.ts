import { BaseAIProvider } from '../../src/ai/provider';

// Mock implementation for testing
class TestProvider extends BaseAIProvider {
  async processText(selectedText: string, prompt: string): Promise<string> {
    return `Modified: ${selectedText}`;
  }

  validateSettings(): boolean {
    return true;
  }
}

describe('BaseAIProvider', () => {
  let provider: TestProvider;

  beforeEach(() => {
    provider = new TestProvider();
  });

  describe('constructor', () => {
    it('should initialize with default max tokens', () => {
      expect(provider.getMaxTokens()).toBe(7000);
    });

    it('should respect custom max tokens up to 7000', () => {
      const customProvider = new TestProvider(5000);
      expect(customProvider.getMaxTokens()).toBe(5000);
    });

    it('should enforce maximum token limit of 7000', () => {
      const customProvider = new TestProvider(10000);
      expect(customProvider.getMaxTokens()).toBe(7000);
    });
  });

  describe('estimateTokenCount', () => {
    it('should estimate token count based on character length', () => {
      // Access protected method through any type casting
      const estimatedTokens = (provider as any).estimateTokenCount('Hello World');
      expect(estimatedTokens).toBe(3); // 11 chars / 4 = 2.75, rounded up to 3
    });

    it('should handle empty string', () => {
      const estimatedTokens = (provider as any).estimateTokenCount('');
      expect(estimatedTokens).toBe(0);
    });
  });

  describe('validateTokenLimit', () => {
    it('should validate text within token limit', () => {
      const shortText = 'Short text';
      const isValid = (provider as any).validateTokenLimit(shortText);
      expect(isValid).toBe(true);
    });

    it('should invalidate text exceeding token limit', () => {
      // Create a very long string (7000 * 4 = 28000 characters)
      const longText = 'a'.repeat(28001);
      const isValid = (provider as any).validateTokenLimit(longText);
      expect(isValid).toBe(false);
    });
  });

  describe('abstract methods', () => {
    it('should implement processText', async () => {
      const result = await provider.processText('test', 'modify');
      expect(result).toBe('Modified: test');
    });

    it('should implement validateSettings', () => {
      const isValid = provider.validateSettings();
      expect(isValid).toBe(true);
    });
  });
});