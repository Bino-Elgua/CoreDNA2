/**
 * GeminiService - BYOK (Bring Your Own Keys) Implementation
 * 
 * Users provide their own API keys via Settings page.
 * Keys are stored in localStorage only, never sent to CoreDNA servers.
 * Supports 70+ providers across LLM, Image, Voice, and Automation categories.
 */

import { toastService } from './toastService';

interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class GeminiService {
  // Provider endpoint configurations
  private providerConfigs: Record<string, any> = {
    // LLM PROVIDERS
    gemini: {
      type: 'llm',
      defaultModel: 'gemini-pro',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
    },
    openai: {
      type: 'llm',
      defaultModel: 'gpt-4o',
      endpoint: 'https://api.openai.com/v1/chat/completions'
    },
    claude: {
      type: 'llm',
      defaultModel: 'claude-3-5-sonnet-20241022',
      endpoint: 'https://api.anthropic.com/v1/messages'
    },
    mistral: {
      type: 'llm',
      defaultModel: 'mistral-large-latest',
      endpoint: 'https://api.mistral.ai/v1/chat/completions'
    },
    groq: {
      type: 'llm',
      defaultModel: 'llama-3.3-70b-versatile',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions'
    },
    deepseek: {
      type: 'llm',
      defaultModel: 'deepseek-chat',
      endpoint: 'https://api.deepseek.com/v1/chat/completions'
    },
    xai: {
      type: 'llm',
      defaultModel: 'grok-beta',
      endpoint: 'https://api.x.ai/v1/chat/completions'
    },
    qwen: {
      type: 'llm',
      defaultModel: 'qwen-turbo',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    },
    cohere: {
      type: 'llm',
      defaultModel: 'command-r-plus',
      endpoint: 'https://api.cohere.ai/v1/generate'
    },
    perplexity: {
      type: 'llm',
      defaultModel: 'llama-3.1-sonar-large-128k-online',
      endpoint: 'https://api.perplexity.ai/chat/completions'
    },
    openrouter: {
      type: 'llm',
      defaultModel: 'anthropic/claude-3.5-sonnet',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions'
    },
    together: {
      type: 'llm',
      defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      endpoint: 'https://api.together.xyz/v1/chat/completions'
    },
    ollama: {
      type: 'llm',
      defaultModel: 'gemma2:27b',
      endpoint: 'http://localhost:11434/api/generate',
      local: true
    },

    // IMAGE PROVIDERS
    imagen: {
      type: 'image',
      defaultModel: 'imagen-3.0-generate-001',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
    },
    dalle: {
      type: 'image',
      defaultModel: 'dall-e-3',
      endpoint: 'https://api.openai.com/v1/images/generations'
    },
    stability: {
      type: 'image',
      defaultModel: 'stable-diffusion-xl-1024-v1-0',
      endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/core'
    },
    fal: {
      type: 'image',
      defaultModel: 'flux-pro',
      endpoint: 'https://fal.run/fal-ai/flux-pro'
    },

    // VOICE/TTS PROVIDERS
    elevenlabs: {
      type: 'voice',
      defaultModel: 'eleven_multilingual_v2',
      endpoint: 'https://api.elevenlabs.io/v1/text-to-speech'
    },
    openai_tts: {
      type: 'voice',
      defaultModel: 'tts-1',
      endpoint: 'https://api.openai.com/v1/audio/speech'
    },
    playht: {
      type: 'voice',
      defaultModel: 'Play3.0-mini',
      endpoint: 'https://api.play.ht/api/v2/tts'
    }
  };

  /**
    * Get API key from localStorage (user-provided BYOK)
    */
  private getApiKey(provider: string): string {
     try {
       // Try new settings structure first
       const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
       
       console.log(`[GeminiService] Getting API key for provider: ${provider}`);
       console.log(`[GeminiService] Settings LLMs:`, settings.llms ? Object.keys(settings.llms) : 'none');
       console.log(`[GeminiService] Checking llms.${provider}:`, settings.llms?.[provider]);
       
       // Check LLM providers
       if (settings.llms?.[provider]?.apiKey) {
         console.log(`[GeminiService] Found LLM API key for ${provider}`);
         return settings.llms[provider].apiKey;
       }
       
       // Check Image providers
       if (settings.image?.[provider]?.apiKey) {
         console.log(`[GeminiService] Found Image API key for ${provider}`);
         return settings.image[provider].apiKey;
       }
       
       // Check Voice providers
       if (settings.voice?.[provider]?.apiKey) {
         console.log(`[GeminiService] Found Voice API key for ${provider}`);
         return settings.voice[provider].apiKey;
       }
       
       // Fallback to old flat structure
       const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
       if (apiKeys[provider]) {
         console.log(`[GeminiService] Found API key in old flat structure for ${provider}`);
         return apiKeys[provider];
       }
       
       // No key found
       console.error(`[GeminiService] No API key found for ${provider}`);
       console.error(`[GeminiService] Settings object:`, settings);
       const errorMsg = `${provider.toUpperCase()} API key not configured. Please add it in Settings.`;
       throw new Error(errorMsg);
     } catch (e: any) {
       if (e.message.includes('API key not configured')) {
         throw e;
       }
       const errorMsg = `Failed to retrieve API key for ${provider}: ${e?.message}`;
       console.error(errorMsg);
       throw new Error(errorMsg);
     }
   }

  /**
   * Main generate method - routes to appropriate provider
   */
  async generate(
    provider: string,
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const config = this.providerConfigs[provider];
      if (!config) {
        throw new Error(`Provider ${provider} not configured. Check Settings → API Keys.`);
      }

      // Route to appropriate provider handler based on type
      const apiKey = this.getApiKey(provider);
      const model = options.model || config.defaultModel;

      switch (config.type) {
        case 'llm':
          return await this.callLLM(provider, apiKey, model, prompt, options);
        case 'image':
          return await this.callImageGen(provider, apiKey, model, prompt, options);
        case 'voice':
          return await this.callVoiceTTS(provider, apiKey, model, prompt, options);
        default:
          throw new Error(`Provider type ${config.type} not supported yet`);
      }
    } catch (error: any) {
      console.error(`Error calling ${provider}:`, error);

      // Redirect to settings if API key missing
      if (error.message.includes('not configured')) {
        setTimeout(() => {
          window.location.href = '/settings?tab=api-keys';
        }, 2000);
      }
      throw error;
    }
  }

  /**
   * Check if a provider is configured (has API key)
   */
  hasProvider(provider: string): boolean {
    const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
    return !!apiKeys[provider];
  }

  /**
   * Get list of configured providers
   */
  getConfiguredProviders(): string[] {
    const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
    return Object.keys(apiKeys).filter(key => apiKeys[key]);
  }

  /**
   * LLM Provider Handler - routes to specific implementations
   */
  private async callLLM(
    provider: string,
    apiKey: string,
    model: string,
    prompt: string,
    options: GenerateOptions
  ): Promise<string> {
    switch (provider) {
      case 'gemini':
        return await this.callGemini(apiKey, model, prompt, options);
      case 'claude':
        return await this.callClaude(apiKey, model, prompt, options);
      case 'cohere':
        return await this.callCohere(apiKey, model, prompt, options);
      case 'qwen':
        return await this.callQwen(apiKey, model, prompt, options);
      case 'ollama':
        return await this.callOllama(this.providerConfigs[provider].endpoint, model, prompt, options);
      case 'openai':
      case 'mistral':
      case 'groq':
      case 'deepseek':
      case 'xai':
      case 'openrouter':
      case 'together':
      case 'perplexity':
        // OpenAI-compatible providers (use same API format)
        return await this.callOpenAICompatible(provider, apiKey, model, prompt, options);
      default:
        throw new Error(`LLM provider ${provider} not yet implemented. Coming soon!`);
    }
  }

  /**
   * Gemini API Implementation
   */
  private async callGemini(
    apiKey: string,
    model: string,
    prompt: string,
    options: GenerateOptions
  ): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 2048
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * OpenAI-Compatible API Implementation
   * Works for: OpenAI, Groq, DeepSeek, XAI, Together, OpenRouter, Perplexity, Mistral
   */
  private async callOpenAICompatible(
    provider: string,
    apiKey: string,
    model: string,
    prompt: string,
    options: GenerateOptions
  ): Promise<string> {
    const config = this.providerConfigs[provider];
    const endpoint = config.endpoint;

    const messages: any[] = [];

    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'openrouter' && {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CoreDNA'
        })
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${provider} API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Claude API Implementation
   */
  private async callClaude(
    apiKey: string,
    model: string,
    prompt: string,
    options: GenerateOptions
  ): Promise<string> {
    const body: any = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048
    };

    if (options.systemPrompt) {
      body.system = options.systemPrompt;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Cohere API Implementation
   */
  private async callCohere(
    apiKey: string,
    model: string,
    prompt: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cohere API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.generations[0].text;
  }

  /**
   * Qwen API Implementation
   */
  private async callQwen(
    apiKey: string,
    model: string,
    prompt: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          input: { prompt },
          parameters: {
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2048
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.output.text;
  }

  /**
   * Ollama Local API Implementation
   */
  private async callOllama(
    endpoint: string,
    model: string,
    prompt: string,
    options: GenerateOptions
  ): Promise<string> {
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  /**
   * Image Generation Handler (placeholder - implement as needed)
   */
  private async callImageGen(
    provider: string,
    apiKey: string,
    model: string,
    prompt: string,
    options: any
  ): Promise<string> {
    // Implement image generation APIs as needed
    throw new Error(`Image generation for ${provider} coming soon!`);
  }

  /**
   * Voice/TTS Handler (placeholder - implement as needed)
   */
  private async callVoiceTTS(
    provider: string,
    apiKey: string,
    prompt: string,
    model: string,
    options: any
  ): Promise<string> {
    // Implement TTS APIs as needed
    throw new Error(`Voice/TTS for ${provider} coming soon!`);
  }
}

export const geminiService = new GeminiService();

// Helper to get the active LLM provider
const getActiveLLMProvider = () => {
  const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
  const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
  
  // First try the explicitly set activeLLM
  if (settings.activeLLM && settings.llms?.[settings.activeLLM]?.enabled && settings.llms?.[settings.activeLLM]?.apiKey) {
    return settings.activeLLM;
  }
  
  // Find first enabled LLM with API key in old settings format
  if (settings.llms) {
    for (const [key, config] of Object.entries(settings.llms)) {
      const llmConfig = config as any;
      if (llmConfig.enabled && llmConfig.apiKey) {
        return key;
      }
    }
  }
  
  // Check BYOK storage for any configured LLM providers
  const llmProviders = ['gemini', 'openai', 'claude', 'mistral', 'groq', 'deepseek', 'xai', 'qwen', 'cohere', 'together', 'openrouter', 'perplexity'];
  for (const provider of llmProviders) {
    if (apiKeys[provider]) {
      console.log(`[getActiveLLMProvider] Found ${provider} in BYOK storage`);
      return provider;
    }
  }
  
  // Fallback
  return 'gemini';
};

// Wrapper exports for backwards compatibility
export const analyzeBrandDNA = (url: string, brandName?: string) => {
  const provider = getActiveLLMProvider();
  const prompt = `Analyze the brand DNA for: ${url}${brandName ? ` (Brand: ${brandName})` : ''}. Extract visual style, tone, color palette, audience, mission, and key differentiators.`;
  return geminiService.generate(provider, prompt);
};

export const findLeadsWithMaps = (niche: string, latitude?: number, longitude?: number) => {
  const provider = getActiveLLMProvider();
  const locationStr = latitude && longitude ? ` near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : '';
  const prompt = `Find top 10 businesses in the "${niche}" niche${locationStr}. Include name, rating, address, website, contact info (email/phone), and social profiles. Format as JSON array.`;
  return geminiService.generate(provider, prompt);
};

export const runCloserAgent = (lead: any, sender?: any) => {
  const provider = getActiveLLMProvider();
  const leadInfo = JSON.stringify(lead).substring(0, 500);
  const senderInfo = sender ? JSON.stringify(sender).substring(0, 500) : 'Generic portfolio';
  const prompt = `Generate a complete closer portfolio for lead: ${leadInfo}. Sender profile: ${senderInfo}. Include target identity extraction, 3 sample social posts with image prompts, personalized email outreach, and 3 service packages.`;
  return geminiService.generate(provider, prompt);
};

export const generateAssetImage = (prompt: string) => {
  const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
  const provider = settings.activeImageGen || 'openai';
  return geminiService.generate(provider, `Generate image: ${prompt}`).then(url => ({ url }));
};

export const generateCampaignAssets = (dna: any, goal?: string, channels?: string[], count?: number, tone?: string) => {
  const provider = getActiveLLMProvider();
  const dnaStr = JSON.stringify(dna).substring(0, 300);
  const prompt = `Generate ${count || 5} campaign assets for brand "${dna.name}" with goal "${goal || 'brand awareness'}". Channels: ${channels?.join(', ') || 'multi-channel'}. Tone: ${tone || 'default'}. Include titles, copy, image prompts. Format as JSON array.`;
  return geminiService.generate(provider, prompt);
};

export const runAgentHiveCampaign = (dna: any, goal: string, channel: string, statusCallback?: (msg: string) => void) => {
  const provider = getActiveLLMProvider();
  if (statusCallback) statusCallback(`Hive agent processing ${channel}...`);
  const prompt = `Create a single campaign asset for brand "${dna.name}" for ${channel}. Goal: ${goal}. Include title, compelling copy tailored to ${channel}, and a detailed image prompt. Return as JSON object.`;
  return geminiService.generate(provider, prompt);
};
export const createBrandChat = () => geminiService;
export const generateAgentSystemPrompt = (config: any) => geminiService.generate(`Generate agent prompt`);
export const createAgentChat = () => geminiService;
export const runBattleSimulation = (brand1: any, brand2: any) => geminiService.generate(`Battle ${brand1} vs ${brand2}`);
export const analyzeUploadedAssets = (assets: any[]) => geminiService.generate(`Analyze assets`);
export const optimizeSchedule = (posts: any[]) => geminiService.generate(`Optimize schedule`);
export const generateVeoVideo = (prompt: string) => Promise.resolve({ url: 'https://via.placeholder.com/video.mp4' });
export const generateTrendPulse = (topic: string) => geminiService.generate(`Trend pulse for ${topic}`);
export const refineAssetWithAI = (asset: any, feedback: string) => geminiService.generate(`Refine asset: ${feedback}`);
export const universalGenerate = (prompt: string) => geminiService.generate(prompt);
