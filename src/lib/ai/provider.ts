/**
 * LLM Provider Abstraction Layer
 * Unified interface for switching providers dynamically
 */

import { geminiService, GenerateOptions } from '../../services/geminiService';
import {
  getApiKey,
  getActiveLLMProvider,
  setActiveLLMProvider,
  getConfiguredLLMProviders,
  hasApiKey,
  getConfigurationSummary
} from '../../services/settingsService';

/**
 * Generate text with currently active provider
 * Throws if no provider configured
 */
export async function generateWithSelectedProvider(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const provider = getActiveLLMProvider();

  if (!provider) {
    throw new Error(
      'No LLM provider selected. Please choose one in Settings.'
    );
  }

  return geminiService.generate(provider, prompt, options);
}

/**
 * Generate text with specific provider override
 */
export async function generateWithProvider(
  provider: string,
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  return geminiService.generate(provider, prompt, options);
}

/**
 * List all available providers with their configuration status
 */
export function getAvailableProviders(): {
  provider: string;
  configured: boolean;
  active: boolean;
}[] {
  const providers = [
    'openai',
    'claude',
    'gemini',
    'mistral',
    'groq',
    'deepseek',
    'xai',
    'perplexity',
    'qwen',
    'cohere',
    'openrouter',
    'together'
  ];

  const activeProvider = getActiveLLMProvider();

  return providers.map(provider => ({
    provider,
    configured: hasApiKey(provider),
    active: provider === activeProvider
  }));
}

/**
 * Switch to a different provider
 */
export function switchProvider(provider: string): void {
  if (!hasApiKey(provider)) {
    throw new Error(`API key not configured for ${provider}`);
  }

  setActiveLLMProvider(provider);
}

/**
 * Get currently active provider
 */
export function getCurrentProvider(): string | null {
  return getActiveLLMProvider();
}

/**
 * Run health check for specific provider
 */
export async function checkProviderHealth(provider: string): Promise<boolean> {
  return geminiService.healthCheck(provider);
}

/**
 * Run health checks for all configured providers
 */
export async function checkAllProvidersHealth(): Promise<{
  provider: string;
  healthy: boolean;
  error?: string;
}[]> {
  const configured = getConfiguredLLMProviders();
  const results = [];

  for (const provider of configured) {
    try {
      const healthy = await checkProviderHealth(provider);
      results.push({ provider, healthy });
    } catch (error) {
      results.push({
        provider,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Get configuration summary
 */
export function getConfigSummary() {
  return getConfigurationSummary();
}
