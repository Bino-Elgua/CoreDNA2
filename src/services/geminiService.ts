/**
 * Unified LLM Service with Multi-Provider Support
 * Routes requests to appropriate provider (OpenAI, Claude, Gemini, etc.)
 */

import { getApiKey, getActiveLLMProvider } from './settingsService';
import { toastService } from './toastService';

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class GeminiService {
  /**
   * Get API key for provider with validation
   */
  private getApiKeyForProvider(provider: string): string {
    const apiKey = getApiKey(provider);

    if (!apiKey) {
      throw new Error(
        `API key not configured for ${provider}. Please add it in Settings.`
      );
    }

    return apiKey;
  }

  /**
   * Generate text using selected provider
   * If no provider specified, use active provider from settings
   */
  async generate(
    provider: string,
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      // Use provided provider or fall back to active
      const activeProvider = provider || getActiveLLMProvider();

      if (!activeProvider) {
        throw new Error(
          'No LLM provider selected. Please configure one in Settings.'
        );
      }

      const apiKey = this.getApiKeyForProvider(activeProvider);

      // Route to provider-specific handler
      switch (activeProvider.toLowerCase()) {
        case 'openai':
        case 'gpt-4':
        case 'gpt-4o':
          return await this.generateOpenAI(prompt, apiKey, options);

        case 'claude':
        case 'anthropic':
          return await this.generateClaude(prompt, apiKey, options);

        case 'gemini':
        case 'google':
          return await this.generateGemini(prompt, apiKey, options);

        case 'mistral':
          return await this.generateMistral(prompt, apiKey, options);

        case 'groq':
          return await this.generateGroq(prompt, apiKey, options);

        case 'deepseek':
          return await this.generateDeepSeek(prompt, apiKey, options);

        case 'xai':
        case 'grok':
          return await this.generateXAI(prompt, apiKey, options);

        case 'perplexity':
          return await this.generatePerplexity(prompt, apiKey, options);

        case 'qwen':
          return await this.generateQwen(prompt, apiKey, options);

        case 'cohere':
          return await this.generateCohere(prompt, apiKey, options);

        case 'openrouter':
          return await this.generateOpenRouter(prompt, apiKey, options);

        case 'together':
          return await this.generateTogether(prompt, apiKey, options);

        default:
          throw new Error(
            `Provider "${activeProvider}" not yet implemented. Check Settings for available providers.`
          );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Generate error [${provider}]:`, message);
      throw error;
    }
  }

  /**
   * OpenAI GPT-4 / GPT-4o
   */
  private async generateOpenAI(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 1.0,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Anthropic Claude
   */
  private async generateClaude(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  /**
   * Google Gemini
   */
  private async generateGemini(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 2000,
            topP: options.topP || 1.0
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  /**
   * Mistral AI
   */
  private async generateMistral(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 1.0
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Mistral error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Groq (fast)
   */
  private async generateGroq(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * DeepSeek
   */
  private async generateDeepSeek(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * xAI Grok
   */
  private async generateXAI(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`xAI error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Perplexity
   */
  private async generatePerplexity(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'pplx-7b-online',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Perplexity error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Qwen (Alibaba)
   */
  private async generateQwen(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        input: { messages: [{ role: 'user', content: prompt }] },
        parameters: {
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Qwen error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.output?.text || '';
  }

  /**
   * Cohere
   */
  private async generateCohere(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        prompt: prompt,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        p: options.topP || 0.75
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cohere error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.generations[0]?.text || '';
  }

  /**
   * OpenRouter (meta-provider)
   */
  private async generateOpenRouter(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://coredna.ai'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Together AI
   */
  private async generateTogether(
    prompt: string,
    apiKey: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.together.xyz/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
        prompt: prompt,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Together error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.output?.choices[0]?.text || '';
  }

  /**
   * Run health check for provider
   */
  async healthCheck(provider: string): Promise<boolean> {
    try {
      const apiKey = this.getApiKeyForProvider(provider);

      // Send minimal request to check connectivity
      const testPrompt = 'Say "OK" only';
      const result = await this.generate(provider, testPrompt, { maxTokens: 10 });

      return result.length > 0;
    } catch (error) {
      console.error(`Health check failed for ${provider}:`, error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();
