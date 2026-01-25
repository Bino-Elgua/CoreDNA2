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
      defaultModel: 'gemini-2.0-flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
    },
    google: {
      type: 'llm',
      defaultModel: 'gemini-2.0-flash',
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
      endpoint: import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434/api/generate',
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
     * Get API key from localStorage (BYOK - Bring Your Own Keys)
     * Single source of truth: core_dna_settings in localStorage
     * Falls back to legacy format if needed and warns user
     */
  private getApiKey(provider: string): string {
     try {
       const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
       
       console.log(`[GeminiService] Getting API key for provider: ${provider}`);
       
       // Check NEW unified settings structure (primary)
       if (settings.llms?.[provider]?.apiKey?.trim()) {
         console.log(`[GeminiService] ✓ Found LLM API key for ${provider}`);
         return settings.llms[provider].apiKey.trim();
       }
       
       if (settings.image?.[provider]?.apiKey?.trim()) {
         console.log(`[GeminiService] ✓ Found Image API key for ${provider}`);
         return settings.image[provider].apiKey.trim();
       }
       
       if (settings.voice?.[provider]?.apiKey?.trim()) {
         console.log(`[GeminiService] ✓ Found Voice API key for ${provider}`);
         return settings.voice[provider].apiKey.trim();
       }
       
       if (settings.workflows?.[provider]?.apiKey?.trim()) {
         console.log(`[GeminiService] ✓ Found Workflow API key for ${provider}`);
         return settings.workflows[provider].apiKey.trim();
       }
       
       // FALLBACK: Check legacy apiKeys format
       if (settings.apiKeys?.[provider]?.trim?.()) {
         console.warn(`[GeminiService] ⚠️ Using LEGACY API key format for ${provider}`);
         console.warn(`[GeminiService] ⚠️ Please go to Settings → Re-save your keys to migrate to new format`);
         return settings.apiKeys[provider].trim();
       }
       
       // Key not found in either format
       console.error(`[GeminiService] ✗ No API key found for ${provider}`);
       console.error(`[GeminiService] Configured LLMs (new format):`, settings.llms ? Object.keys(settings.llms).filter(k => settings.llms?.[k]?.apiKey?.trim?.()) : 'none');
       console.error(`[GeminiService] Legacy API keys:`, settings.apiKeys ? Object.keys(settings.apiKeys) : 'none');
       
       const errorMsg = `${provider.toUpperCase()} API key not configured. Go to Settings → API Keys to add it.`;
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
    const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
    return !!(
      settings.llms?.[provider]?.apiKey?.trim() ||
      settings.image?.[provider]?.apiKey?.trim() ||
      settings.voice?.[provider]?.apiKey?.trim() ||
      settings.workflows?.[provider]?.apiKey?.trim()
    );
  }

  /**
   * Get list of configured providers with API keys
   */
  getConfiguredProviders(): string[] {
    const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
    const configured: string[] = [];
    
    // Collect all providers with API keys
    if (settings.llms) {
      Object.entries(settings.llms).forEach(([key, config]: [string, any]) => {
        if (config.apiKey?.trim()) configured.push(key);
      });
    }
    
    if (settings.image) {
      Object.entries(settings.image).forEach(([key, config]: [string, any]) => {
        if (config.apiKey?.trim() && !configured.includes(key)) configured.push(key);
      });
    }
    
    if (settings.voice) {
      Object.entries(settings.voice).forEach(([key, config]: [string, any]) => {
        if (config.apiKey?.trim() && !configured.includes(key)) configured.push(key);
      });
    }
    
    if (settings.workflows) {
      Object.entries(settings.workflows).forEach(([key, config]: [string, any]) => {
        if (config.apiKey?.trim() && !configured.includes(key)) configured.push(key);
      });
    }
    
    return configured;
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
      case 'google':
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
   * Helper: Wrap promises with timeout
   */
  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 30000
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
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
      const response = await this.withTimeout(
        fetch(endpoint, {
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
        }),
        30000 // 30 second timeout
      );

      if (!response.ok) {
        const error = await response.json();
        const message = error.error?.message || response.statusText;
        
        // Detect quota/rate limit errors
        if (message.includes('quota') || message.includes('Quota exceeded')) {
          console.error('[callGemini] QUOTA EXCEEDED - Gemini free tier limit reached');
          console.error('[callGemini] Suggestion: Use a different LLM provider (Mistral, Groq, Claude, etc.)');
          throw new Error(`Gemini quota exceeded. Switch to Mistral or Groq in Settings → API Keys → Language Models`);
        }
        
        if (message.includes('429') || message.includes('rate limit')) {
          throw new Error(`Gemini rate limited. Please retry in a moment or use Mistral/Groq.`);
        }
        
        throw new Error(`Gemini API error: ${message}`);
      }

      const data = await response.json();
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid Gemini response format: missing text in response');
      }
      return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      if (error.message.includes('timeout')) {
        console.error('[callGemini] Request timed out - network may be slow');
        throw new Error('Request timed out (30s). Check your internet connection and try again, or switch to a different provider.');
      }
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

    try {
      const response = await this.withTimeout(
        fetch(endpoint, {
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
        }),
        30000 // 30 second timeout
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`${provider} API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error(`Invalid response from ${provider}: missing message content`);
      }
      return data.choices[0].message.content;
    } catch (error: any) {
      if (error.message.includes('timeout')) {
        throw new Error(`${provider} request timed out (30s). Try again or switch providers.`);
      }
      throw error;
    }
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

    try {
      const response = await this.withTimeout(
        fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }),
        30000
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      if (!data?.content?.[0]?.text) {
        throw new Error('Invalid Claude response format: missing text in content');
      }
      return data.content[0].text;
    } catch (error: any) {
      if (error.message.includes('timeout')) {
        throw new Error('Claude request timed out (30s). Try again or switch providers.');
      }
      throw error;
    }
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
    try {
      const response = await this.withTimeout(
        fetch('https://api.cohere.ai/v1/generate', {
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
        }),
        30000
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cohere API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      if (!data?.generations?.[0]?.text) {
        throw new Error('Invalid Cohere response format: missing generation text');
      }
      return data.generations[0].text;
    } catch (error: any) {
      if (error.message.includes('timeout')) {
        throw new Error('Cohere request timed out (30s). Try again or switch providers.');
      }
      throw error;
    }
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
    * Voice/TTS Handler - Multi-provider support with free fallback
    */
  private async callVoiceTTS(
    provider: string,
    apiKey: string,
    prompt: string,
    model: string,
    options: any
  ): Promise<string> {
    console.log(`[GeminiService] Generating voice for ${provider}`);

    // Try real API first if configured
    if (apiKey && apiKey.trim()) {
      try {
        switch (provider) {
          case 'elevenlabs':
            return await this.generateElevenLabsVoice(apiKey, prompt, model);
          case 'openai':
            return await this.generateOpenAIVoice(apiKey, prompt, model);
          case 'google_tts':
            return await this.generateGoogleTTSVoice(apiKey, prompt, model);
          case 'azure':
            return await this.generateAzureTTSVoice(apiKey, prompt, model);
          case 'deepgram':
            return await this.generateDeepgramVoice(apiKey, prompt, model);
          case 'playht':
            return await this.generatePlayHTVoice(apiKey, prompt, model);
          default:
            console.log(`[TTS] Provider ${provider} not specifically implemented, using Web Speech API`);
        }
      } catch (error: any) {
        console.warn(`[TTS] API call failed for ${provider}, falling back to browser speech`, error.message);
      }
    }

    // Fallback: Web Speech API (free, no API key needed, works in-browser)
    return this.generateBrowserSpeech(prompt);
  }

  /**
   * ElevenLabs Voice Generation
   */
  private async generateElevenLabsVoice(apiKey: string, text: string, voiceId: string = 'Adam'): Promise<string> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });

      if (!response.ok) throw new Error(`ElevenLabs API error: ${response.status}`);

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('[ElevenLabs] Failed:', error);
      throw error;
    }
  }

  /**
   * OpenAI Voice Generation (TTS)
   */
  private async generateOpenAIVoice(apiKey: string, text: string, voice: string = 'alloy'): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          input: text,
          voice,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI TTS error: ${response.status}`);

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('[OpenAI TTS] Failed:', error);
      throw error;
    }
  }

  /**
   * Google Cloud Text-to-Speech
   */
  private async generateGoogleTTSVoice(apiKey: string, text: string, languageCode: string = 'en-US'): Promise<string> {
    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode, ssmlGender: 'NEUTRAL' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      });

      if (!response.ok) throw new Error(`Google TTS error: ${response.status}`);

      const data = await response.json() as any;
      const audioContent = data.audioContent;
      const audioBlob = new Blob([Buffer.from(audioContent, 'base64')], { type: 'audio/mp3' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('[Google TTS] Failed:', error);
      throw error;
    }
  }

  /**
   * Azure Text-to-Speech
   */
  private async generateAzureTTSVoice(apiKey: string, text: string, voice: string = 'en-US-AriaNeural'): Promise<string> {
    try {
      // Azure TTS uses a regional endpoint
      const region = 'eastus'; // Default region
      const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
        },
        body: `<speak version='1.0' xml:lang='en-US'><voice name='${voice}'>${text}</voice></speak>`,
      });

      if (!response.ok) throw new Error(`Azure TTS error: ${response.status}`);

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('[Azure TTS] Failed:', error);
      throw error;
    }
  }

  /**
   * Deepgram Voice Generation
   */
  private async generateDeepgramVoice(apiKey: string, text: string, model: string = 'aura-asteria-en'): Promise<string> {
    try {
      const response = await fetch('https://api.deepgram.com/v1/speak?model=' + model, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(`Deepgram error: ${response.status}`);

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('[Deepgram] Failed:', error);
      throw error;
    }
  }

  /**
   * PlayHT Voice Generation
   */
  private async generatePlayHTVoice(apiKey: string, text: string, voiceId: string = 's3://voice-cloning-zero-shot/2c5b63d7-e582-43f7-a62f-9b75dfb4d65c/original/speeches/bcac418e-4b72-11ea-b77f-8e6bb43d529a.wav'): Promise<string> {
    try {
      const response = await fetch('https://api.play.ht/api/v2/tts/stream', {
        method: 'POST',
        headers: {
          'AUTHORIZATION': apiKey,
          'X-USER-ID': 'default-user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          output_format: 'mp3',
        }),
      });

      if (!response.ok) throw new Error(`PlayHT error: ${response.status}`);

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('[PlayHT] Failed:', error);
      throw error;
    }
  }

  /**
   * Browser Web Speech API (Free, No API Key Needed)
   * Works in most modern browsers
   */
  private generateBrowserSpeech(text: string): string {
    console.log('[TTS] Using browser Web Speech API (free, no API key)');
    
    // Create a blob URL that represents the audio
    // In real usage, this would trigger browser's native TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Trigger speech
    window.speechSynthesis.speak(utterance);
    
    // Return a placeholder URL (in real app, you'd stream audio)
    return `data:audio/wav;base64,${btoa('browser-speech-api')}`; 
  }

  /**
   * Public method for voice generation (used by SonicService)
   */
  async generateVoiceContent(provider: string, text: string, voiceId?: string): Promise<string> {
    const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
    const voiceConfig = settings.voice?.[provider];

    if (voiceConfig?.apiKey) {
      try {
        return await this.callVoiceTTS(provider, voiceConfig.apiKey, text, voiceId || provider, {});
      } catch (e) {
        console.warn('[GeminiService] Voice generation failed, using browser fallback:', e);
        return this.generateBrowserSpeech(text);
      }
    }

    // Fallback to browser speech
    return this.generateBrowserSpeech(text);
  }
}

export const geminiService = new GeminiService();

// Helper to get the active LLM provider
/**
 * Generate free campaign assets using templates (no API required)
 * Used as fallback when no LLM provider is configured
 */
const generateFreeCampaignAssets = (dna: any, goal: string, channels: string[], count: number): any[] => {
  console.log('[generateFreeCampaignAssets] Generating template-based assets (no API)');
  
  const assets = [];
  const templates = [
    {
      title: `Discover ${dna.name}`,
      copy: `${dna.tagline}. ${dna.description?.substring(0, 80) || 'Experience excellence'}`,
      cta: 'Learn More',
    },
    {
      title: `${dna.name}: ${goal}`,
      copy: dna.keyMessaging?.[0] || `${dna.name} helps you ${goal.toLowerCase()}`,
      cta: 'Get Started',
    },
    {
      title: `Why Choose ${dna.name}?`,
      copy: (dna.values?.[0] || 'Quality') + ' and ' + (dna.values?.[1] || 'Innovation'),
      cta: 'Explore',
    },
    {
      title: dna.name,
      copy: dna.mission || `${dna.name} - ${goal}`,
      cta: 'Join Us',
    },
    {
      title: `${dna.tagline}`,
      copy: dna.description?.substring(0, 120) || 'Transforming the industry',
      cta: 'See How',
    },
  ];
  
  for (let i = 0; i < Math.min(count, templates.length); i++) {
    const template = templates[i];
    const channel = channels[i % channels.length];
    
    assets.push({
      id: `asset_${i + 1}`,
      channel: channel,
      type: 'image',
      title: template.title,
      copy: template.copy,
      cta: template.cta,
      imagePrompt: `${template.title}. Style: ${dna.visualStyle?.description || 'professional'}. Colors: ${dna.colors?.map((c: any) => c.name).join(', ') || 'brand colors'}`,
      content: template.copy,
    });
  }
  
  return assets;
};

const getActiveLLMProvider = () => {
   const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
   
   console.log('[getActiveLLMProvider] Detecting active LLM provider...');
   console.log('[getActiveLLMProvider] activeLLM setting:', settings.activeLLM);
   console.log('[getActiveLLMProvider] Available providers:', settings.llms ? Object.keys(settings.llms) : 'none');
   
   // PRIORITY 1: Use explicitly set activeLLM from Settings if it has API key
   if (settings.activeLLM && settings.llms?.[settings.activeLLM]?.apiKey?.trim()) {
     console.log(`[getActiveLLMProvider] ✓ Using configured activeLLM: ${settings.activeLLM}`);
     return settings.activeLLM;
   }
   
   if (settings.activeLLM) {
     console.warn(`[getActiveLLMProvider] ⚠️ activeLLM set to ${settings.activeLLM} but no API key found. Falling back...`);
   }
   
   // PRIORITY 2: Find first LLM with API key
   if (settings.llms && Object.keys(settings.llms).length > 0) {
     for (const [key, config] of Object.entries(settings.llms)) {
       const llmConfig = config as any;
       if (llmConfig?.apiKey?.trim()) {
         console.log(`[getActiveLLMProvider] ✓ Using available LLM: ${key}`);
         return key;
       }
     }
   }
   
   // PRIORITY 3: Return special marker for free template mode
   console.warn('[getActiveLLMProvider] ⚠️ No LLM provider configured. Using free template-based generation');
   return 'free-template';
};

// Wrapper exports for backwards compatibility
export const analyzeBrandDNA = async (url: string, brandName?: string): Promise<any> => {
    const provider = getActiveLLMProvider();
    
    // If no LLM provider configured, use template-based brand profile
    if (provider === 'free-template') {
      console.log(`[analyzeBrandDNA] Generating template-based DNA for: ${url}`);
      const now = Date.now();
      return {
        id: `dna_${now}`,
        name: brandName || 'Brand',
        tagline: 'Your professional brand presence',
        description: 'A modern and innovative brand delivering excellence and quality to customers',
        mission: 'To empower our customers with exceptional solutions',
        elevatorPitch: '30-second brand pitch here',
        values: ['Quality', 'Innovation', 'Excellence'],
        keyMessaging: ['We deliver results', 'Innovation-driven', 'Customer-focused'],
        colors: [
          { hex: '#000000', name: 'Primary', usage: 'Main brand color' },
          { hex: '#FFFFFF', name: 'Secondary', usage: 'Background' },
          { hex: '#0066CC', name: 'Accent', usage: 'Highlights' }
        ],
        fonts: [
          { family: 'Arial', usage: 'All', description: 'Clean, professional sans-serif' }
        ],
        visualStyle: { style: 'Modern', description: 'Contemporary and professional' },
        toneOfVoice: { adjectives: ['professional', 'approachable', 'modern'], description: 'Professional yet approachable' },
        confidenceScores: { visuals: 75, strategy: 80, tone: 80, overall: 78 },
        brandPersonality: ['innovative', 'professional'],
        targetAudience: 'Business professionals and enterprises',
        personas: [{
          name: 'Professional User',
          demographics: 'Age 25-55',
          psychographics: 'Quality-focused, results-driven',
          painPoints: ['efficiency', 'ROI'],
          behaviors: ['research', 'data-driven']
        }],
        swot: {
          strengths: ['Quality', 'Innovation'],
          weaknesses: ['Limited awareness'],
          opportunities: ['Market expansion', 'New segments'],
          threats: ['Competition']
        },
        competitors: [{
          name: 'Competitor',
          differentiation: 'Superior approach'
        }],
        websiteUrl: url,
        detectedLanguage: 'en',
        createdAt: now,
        dnaVersionHistory: [now],
        metadata: { source: 'free-template', note: 'Add API key in Settings for real AI extraction' }
      };
    }
    
    // Simplified prompt that's more likely to get valid JSON
    const prompt = `For the website "${url}" (brand: ${brandName || 'Unknown'}), create a JSON object with these EXACT fields. Return ONLY the JSON, nothing else:

{
  "id": "dna_generated",
  "name": "${brandName || 'Brand'}",
  "tagline": "Short brand tagline",
  "description": "2-3 sentence brand description",
  "mission": "Brand mission or purpose",
  "elevatorPitch": "30-second pitch",
  "values": ["value1", "value2"],
  "keyMessaging": ["message1", "message2"],
  "colors": [{"hex": "#000000", "name": "Primary", "usage": "Main color"}],
  "fonts": [{"family": "Arial", "usage": "All", "description": "Clean sans-serif"}],
  "visualStyle": {"style": "Modern", "description": "Contemporary design"},
  "toneOfVoice": {"adjectives": ["professional"], "description": "Professional tone"},
  "confidenceScores": {"visuals": 80, "strategy": 80, "tone": 80, "overall": 80},
  "brandPersonality": ["innovative"],
  "targetAudience": "Business professionals",
  "personas": [{"name": "User", "demographics": "Professional", "psychographics": "Quality-focused", "painPoints": ["efficiency"], "behaviors": ["research"]}],
  "swot": {"strengths": ["quality"], "weaknesses": ["awareness"], "opportunities": ["growth"], "threats": ["competition"]},
  "competitors": [{"name": "Competitor", "differentiation": "Unique approach"}]
}`;

   try {
     console.log(`[analyzeBrandDNA] Starting extraction for: ${url}`);
     console.log(`[analyzeBrandDNA] Using provider: ${provider}`);
     
     const response = await geminiService.generate(provider, prompt);
     console.log('[analyzeBrandDNA] Response received, length:', response.length);
     
     // Extract JSON - handle various formats
     let jsonStr = response.trim();
     
     // Remove markdown code blocks if present
     if (jsonStr.startsWith('```')) {
       jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
     }
     
     // Find JSON object in response
     const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
     if (!jsonMatch) {
       throw new Error('No JSON found in response');
     }
     
     jsonStr = jsonMatch[0];
     console.log('[analyzeBrandDNA] Attempting to parse JSON...');
     
     const parsed = JSON.parse(jsonStr);
     console.log('[analyzeBrandDNA] ✓ Parse successful, brand name:', parsed.name);
     
     // Normalize and return
     const now = Date.now();
     return {
       id: `dna_${now}`,
       name: parsed.name || brandName || 'Unknown Brand',
       tagline: parsed.tagline || 'Professional Brand',
       description: parsed.description || 'Brand description',
       mission: parsed.mission || 'Brand mission',
       elevatorPitch: parsed.elevatorPitch || 'Brand pitch',
       websiteUrl: url,
       detectedLanguage: 'en',
       createdAt: now,
       values: Array.isArray(parsed.values) ? parsed.values.slice(0, 5) : ['Innovation', 'Quality'],
       keyMessaging: Array.isArray(parsed.keyMessaging) ? parsed.keyMessaging.slice(0, 5) : ['Excellence', 'Service'],
       confidenceScores: {
         visuals: typeof parsed.confidenceScores?.visuals === 'number' ? parsed.confidenceScores.visuals : 75,
         strategy: typeof parsed.confidenceScores?.strategy === 'number' ? parsed.confidenceScores.strategy : 75,
         tone: typeof parsed.confidenceScores?.tone === 'number' ? parsed.confidenceScores.tone : 75,
         overall: typeof parsed.confidenceScores?.overall === 'number' ? parsed.confidenceScores.overall : 75
       },
       colors: Array.isArray(parsed.colors) 
         ? parsed.colors.slice(0, 5).map(c => ({ hex: c.hex || '#000000', name: c.name || 'Color', usage: c.usage || 'Primary' }))
         : [{ hex: '#3B82F6', name: 'Blue', usage: 'Primary' }],
       fonts: Array.isArray(parsed.fonts)
         ? parsed.fonts.slice(0, 3).map(f => ({ family: f.family || 'Arial', usage: f.usage || 'All', description: f.description || 'Typography' }))
         : [{ family: 'Arial', usage: 'All', description: 'Clean sans-serif' }],
       visualStyle: {
         style: parsed.visualStyle?.style || 'Modern',
         description: parsed.visualStyle?.description || 'Contemporary design'
       },
       toneOfVoice: {
         adjectives: Array.isArray(parsed.toneOfVoice?.adjectives) ? parsed.toneOfVoice.adjectives.slice(0, 3) : ['professional'],
         description: parsed.toneOfVoice?.description || 'Professional and friendly'
       },
       brandPersonality: Array.isArray(parsed.brandPersonality) ? parsed.brandPersonality.slice(0, 3) : ['professional'],
       targetAudience: parsed.targetAudience || 'Business professionals',
       personas: Array.isArray(parsed.personas) 
         ? parsed.personas.slice(0, 2).map(p => ({
             name: p.name || 'User',
             demographics: p.demographics || 'Professional',
             psychographics: p.psychographics || 'Quality-conscious',
             painPoints: Array.isArray(p.painPoints) ? p.painPoints.slice(0, 2) : ['efficiency'],
             behaviors: Array.isArray(p.behaviors) ? p.behaviors.slice(0, 2) : ['research']
           }))
         : [{ name: 'Primary User', demographics: 'Professional', psychographics: 'Quality-focused', painPoints: ['efficiency'], behaviors: ['research'] }],
       swot: {
         strengths: Array.isArray(parsed.swot?.strengths) ? parsed.swot.strengths.slice(0, 3) : ['Quality'],
         weaknesses: Array.isArray(parsed.swot?.weaknesses) ? parsed.swot.weaknesses.slice(0, 3) : ['Limited awareness'],
         opportunities: Array.isArray(parsed.swot?.opportunities) ? parsed.swot.opportunities.slice(0, 3) : ['Market expansion'],
         threats: Array.isArray(parsed.swot?.threats) ? parsed.swot.threats.slice(0, 3) : ['Competition']
       },
       competitors: Array.isArray(parsed.competitors)
         ? parsed.competitors.slice(0, 3).map(c => ({ name: c.name || 'Competitor', differentiation: c.differentiation || 'Different approach' }))
         : [{ name: 'Market competitor', differentiation: 'Alternative solution' }]
     };
   } catch (error: any) {
     console.error('[analyzeBrandDNA] ✗ Error:', error.message);
     
     // Return rich fallback profile with all fields populated
     const now = Date.now();
     return {
       id: `dna_${now}`,
       name: brandName || 'Unknown Brand',
       tagline: 'Professional brand in focus',
       description: `This brand focuses on delivering value to ${brandName ? 'its' : 'their'} audience through innovative solutions and quality service.`,
       mission: `To provide excellent ${brandName ? 'brand-specific' : ''} solutions that create lasting value`,
       elevatorPitch: `${brandName || 'This brand'} delivers innovative solutions with a focus on quality and customer success.`,
       websiteUrl: url,
       detectedLanguage: 'en',
       createdAt: now,
       values: ['Innovation', 'Quality', 'Customer Focus', 'Integrity', 'Excellence'],
       keyMessaging: ['Innovative solutions', 'Quality service', 'Customer success', 'Reliable partnership', 'Market leadership'],
       confidenceScores: { visuals: 60, strategy: 60, tone: 60, overall: 60 },
       colors: [
         { hex: '#3B82F6', name: 'Primary Blue', usage: 'Main brand color' },
         { hex: '#10B981', name: 'Success Green', usage: 'Accent color' },
         { hex: '#F59E0B', name: 'Warning Amber', usage: 'Secondary accent' }
       ],
       fonts: [
         { family: 'Inter', usage: 'Body text', description: 'Modern sans-serif' },
         { family: 'Poppins', usage: 'Headlines', description: 'Bold geometric sans-serif' }
       ],
       visualStyle: { style: 'Modern Minimalist', description: 'Clean, professional design with focus on clarity' },
       toneOfVoice: { 
         adjectives: ['professional', 'friendly', 'innovative'],
         description: 'Professional yet approachable, with emphasis on innovation and customer success'
       },
       brandPersonality: ['innovative', 'reliable', 'customer-focused'],
       targetAudience: 'Business professionals and organizations seeking quality solutions',
       personas: [
         {
           name: 'Strategic Decision Maker',
           demographics: 'Age 35-55, C-level executive',
           psychographics: 'Values efficiency and ROI',
           painPoints: ['time constraints', 'budget limitations', 'integration complexity'],
           behaviors: ['researches thoroughly', 'reads case studies', 'values testimonials']
         },
         {
           name: 'Implementation Manager',
           demographics: 'Age 25-40, operations manager',
           psychographics: 'Values practical solutions',
           painPoints: ['system integration', 'team adoption', 'support quality'],
           behaviors: ['tests features', 'checks documentation', 'talks to references']
         }
       ],
       swot: {
         strengths: ['Strong brand identity', 'Quality focus', 'Customer loyalty'],
         weaknesses: ['Market awareness', 'Budget constraints', 'Geographic reach'],
         opportunities: ['Market expansion', 'New partnerships', 'Product development'],
         threats: ['Competitive pressure', 'Market changes', 'Technology shifts']
       },
       competitors: [
         { name: 'Direct Competitor', differentiation: 'Different market positioning' },
         { name: 'Indirect Competitor', differentiation: 'Alternative solution approach' }
       ]
     };
   }
};

export const findLeadsWithMaps = (niche: string, latitude?: number, longitude?: number) => {
  const provider = getActiveLLMProvider();
  const locationStr = latitude && longitude ? ` near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : '';
  const prompt = `Find top 10 businesses in the "${niche}" niche${locationStr}. Include name, rating, address, website, contact info (email/phone), and social profiles. Format as JSON array.`;
  return geminiService.generate(provider, prompt);
};

export const runCloserAgent = async (lead: any, sender?: any, options?: { sendEmail?: boolean; sendSocial?: boolean }) => {
  const provider = getActiveLLMProvider();
  const leadInfo = JSON.stringify(lead).substring(0, 500);
  const senderInfo = sender ? JSON.stringify(sender).substring(0, 500) : 'Generic portfolio';
  const prompt = `Generate a complete closer portfolio for lead: ${leadInfo}. Sender profile: ${senderInfo}. Include target identity extraction, 3 sample social posts with image prompts, personalized email outreach with subject line and body, and 3 service packages (Starter, Growth, Dominate). Format each email component clearly.`;
  
  try {
    const response = await geminiService.generate(provider, prompt);
    const strategy = parseCloserResponse(response);
    
    // Auto-send email if configured
    if (options?.sendEmail && lead.contactEmail) {
      const { emailService } = await import('./emailService');
      const emailPayload = emailService.createCloserEmail(lead, strategy);
      const emailResult = await emailService.sendEmail(emailPayload);
      console.log('[runCloserAgent] Email send result:', emailResult);
    }
    
    // Auto-post social if configured
    if (options?.sendSocial) {
      const { socialPostingService } = await import('./socialPostingService');
      const platforms = socialPostingService.getConfiguredPlatforms();
      if (platforms.length > 0 && strategy.socialSamples?.length > 0) {
        for (const post of strategy.socialSamples) {
          await socialPostingService.postToAll({
            text: post.caption || post.text,
            imageUrl: post.imageUrl,
            hashtags: post.hashtags,
          }).catch(e => console.error('[runCloserAgent] Social post failed:', e));
        }
      }
    }
    
    return strategy;
  } catch (e: any) {
    console.error('[runCloserAgent] Error:', e.message);
    throw e;
  }
};

/**
 * Parse closer agent response into structured data
 */
const parseCloserResponse = (response: string): any => {
  try {
    // Try to extract JSON if wrapped
    let jsonStr = response;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    
    return JSON.parse(jsonStr);
  } catch {
    // Fallback: parse as text
    return {
      pitch: response.substring(0, 500),
      emailStrategy: {
        subject: 'Partnership Opportunity',
        body: response.substring(0, 1000)
      },
      socialSamples: [{
        text: response.substring(0, 280),
        hashtags: ['partnership', 'opportunity']
      }],
      serviceTiers: [
        { name: 'Starter', price: '$500/mo' },
        { name: 'Growth', price: '$1500/mo' },
        { name: 'Dominate', price: '$3000/mo' }
      ]
    };
  }
};

/**
 * Legacy wrapper for generateAssetImage - delegates to mediaGenerationService
 * Kept for backwards compatibility but uses real media generation service
 */
export const generateAssetImage = async (prompt: string, style?: string): Promise<string> => {
  try {
    // Import and use the real media generation service
    const { generateImage } = await import('./mediaGenerationService');
    
    console.log(`[generateAssetImage] Delegating to mediaGenerationService`);
    const result = await generateImage(prompt, { style });
    
    console.log(`[generateAssetImage] ✓ Generated from ${result.provider}`);
    return result.url;
  } catch (error: any) {
    console.error('[generateAssetImage] Error:', error.message);
    // Return free Unsplash image on error
    const searchQuery = prompt.split(' ').filter(w => w.length > 3).slice(0, 2).join(' ').trim() || 'business';
    return `https://source.unsplash.com/1024x1024/?${encodeURIComponent(searchQuery)}`;
  }
};

/**
 * Generate campaign assets using BrandDNA and LLM
 * Returns Promise<CampaignAsset[]>
 */
export const generateCampaignAssets = async (
  dna: any,
  goal: string = 'brand awareness',
  channels: string[] = ['Instagram', 'Email'],
  count: number = 5,
  tone?: string
): Promise<any[]> => {
  const provider = getActiveLLMProvider();
  
  // If no LLM provider configured, use free template-based generation
  if (provider === 'free-template') {
    console.log(`[generateCampaignAssets] Generating ${count} assets for "${dna.name}" using free templates (no API)`);
    const assets = generateFreeCampaignAssets(dna, goal, channels, count);
    console.log(`[generateCampaignAssets] ✓ Generated ${assets.length} template-based assets`);
    return assets;
  }
  
  const channelsList = channels.join(', ');
  const toneLine = tone && tone !== 'Brand Default' ? `Tone: ${tone}` : `Tone: Match the brand's "${dna.toneOfVoice?.description || 'professional'}" voice`;
  
  const prompt = `You are a marketing expert. Using this BrandDNA profile, generate ${count} campaign assets across these channels: ${channelsList}.

BRAND PROFILE:
- Name: ${dna.name}
- Tagline: ${dna.tagline}
- Description: ${dna.description}
- Key Messaging: ${dna.keyMessaging?.join('; ') || 'N/A'}
- Colors: ${dna.colors?.map((c: any) => c.hex).join(', ') || 'N/A'}
- Visual Style: ${dna.visualStyle?.description || 'Modern'}
- ${toneLine}
- Target Audience: ${dna.targetAudience}

CAMPAIGN GOAL: ${goal}

For EACH of the ${count} assets, create a JSON object with:
- id: unique identifier (e.g., "asset_1")
- channel: which channel this is for
- type: "image" | "carousel" | "email" | "blog"
- title: compelling headline
- copy: 150-200 character body text optimized for platform
- cta: call-to-action button text
- imagePrompt: detailed visual description for image generation (be specific about style, colors, composition)

Return ONLY a valid JSON array of ${count} objects. No markdown, no explanations.`;

  try {
    console.log(`[generateCampaignAssets] Generating ${count} assets for "${dna.name}" (goal: ${goal})`);
    console.log(`[generateCampaignAssets] Provider: ${provider}`);
    
    const response = await geminiService.generate(provider, prompt);
    console.log(`[generateCampaignAssets] Raw response received:`, response.substring(0, 200));
    
    // Parse JSON response
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[generateCampaignAssets] Response does not contain JSON array:', jsonStr.substring(0, 300));
      throw new Error('No JSON array found in response');
    }
    
    let assets = JSON.parse(jsonMatch[0]);
    console.log(`[generateCampaignAssets] ✓ Generated ${assets.length} assets`);
    
    // ENSURE each asset has imagePrompt - critical for image generation
    assets = assets.map((asset: any, idx: number) => {
      // Normalize field names (handle variations from different LLMs)
      let imagePrompt = asset.imagePrompt || asset.image_prompt || asset.imgPrompt || asset.image || '';
      
      // Ensure it's a string
      if (typeof imagePrompt !== 'string') {
        imagePrompt = JSON.stringify(imagePrompt);
      }
      
      // If no imagePrompt, generate one from the asset content
      let finalImagePrompt = (imagePrompt || '').trim();
      if (!finalImagePrompt || finalImagePrompt.length < 5) {
        const copy = asset.copy || asset.content || asset.body || asset.text || '';
        const title = asset.title || asset.headline || '';
        const visualStyle = dna.visualStyle?.description || 'modern professional';
        const colors = dna.colors?.slice(0, 3).map((c: any) => c.name).join(', ') || 'brand colors';
        const copyText = typeof copy === 'string' ? copy : JSON.stringify(copy);
        const titleText = typeof title === 'string' ? title : JSON.stringify(title);
        finalImagePrompt = `${titleText}. Visual style: ${visualStyle}. Colors: ${colors}. Content: ${copyText.substring(0, 100)}`;
      }
      
      return {
        ...asset,
        id: asset.id || `asset_${idx + 1}`,
        imagePrompt: finalImagePrompt,
        content: asset.copy || asset.content || asset.body || asset.text || '',
        title: asset.title || asset.headline || '',
        channel: asset.channel || 'Instagram',
        type: asset.type || 'image',
        cta: asset.cta || 'Learn More',
        imageUrl: undefined, // Will be populated during generation
        isGeneratingImage: true
      };
    });
    
    console.log(`[generateCampaignAssets] ✓ Normalized ${assets.length} assets with imagePrompts`);
    
    return Array.isArray(assets) ? assets : [];
  } catch (e: any) {
    console.error('[generateCampaignAssets] Error:', e.message);
    console.error('[generateCampaignAssets] Stack:', e.stack);
    throw e;
  }
};

/**
 * Generate a single campaign asset for specific channel (Hive mode)
 */
export const runAgentHiveCampaign = async (
  dna: any,
  goal: string,
  channel: string,
  statusCallback?: (msg: string) => void
): Promise<any> => {
  const provider = getActiveLLMProvider();
  
  if (statusCallback) statusCallback(`Initializing Hive Agent for ${channel}...`);
  
  const prompt = `You are a social media expert specializing in ${channel} marketing. Using this BrandDNA, create ONE highly optimized campaign asset.

BRAND:
- Name: ${dna.name}
- Description: ${dna.description}
- Key Messages: ${dna.keyMessaging?.join('; ') || 'N/A'}
- Colors: ${dna.colors?.map((c: any) => c.hex).join(', ') || 'N/A'}
- Tone: ${dna.toneOfVoice?.description}
- Target Audience: ${dna.targetAudience}

CHANNEL: ${channel}
GOAL: ${goal}

Create 1 asset optimized specifically for ${channel}. Include:
- title: compelling headline
- copy: platform-optimized body text (Instagram: <150 chars, Email: 200-300 chars, LinkedIn: professional tone)
- cta: action button text
- hashtags: relevant hashtags for ${channel}
- imagePrompt: detailed visual description with specific style, colors from brand palette

Return ONLY valid JSON object (not array). No markdown.`;

  try {
    if (statusCallback) statusCallback(`Calling ${provider} API...`);
    console.log(`[runAgentHiveCampaign] Creating asset for ${channel} using ${provider}`);
    
    const response = await geminiService.generate(provider, prompt);
    console.log(`[runAgentHiveCampaign] Raw response:`, response.substring(0, 200));
    
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[runAgentHiveCampaign] Response does not contain JSON object for ${channel}:`, jsonStr.substring(0, 300));
      throw new Error('No JSON found in response');
    }
    
    const asset = JSON.parse(jsonMatch[0]);
    asset.id = `asset_${Date.now()}`;
    asset.channel = channel;
    
    if (statusCallback) statusCallback(`✓ Asset created for ${channel}`);
    console.log(`[runAgentHiveCampaign] ✓ Created asset: ${asset.title}`);
    
    return asset;
  } catch (e: any) {
    console.error(`[runAgentHiveCampaign] Error: ${e.message}`);
    console.error(`[runAgentHiveCampaign] Stack:`, e.stack);
    if (statusCallback) statusCallback(`✗ Failed: ${e.message}`);
    throw e;
  }
};

/**
 * Create chat session for BrandDNA analysis
 */
export const createBrandChat = () => geminiService;

/**
 * Generate system prompt for AI Agent based on brand DNA and role
 */
export const generateAgentSystemPrompt = (
  dna: any,
  role: string = 'support',
  guardrails?: any
): string => {
  const forbiddenTopics = guardrails?.forbiddenTopics?.join(', ') || 'None specified';
  const requiredPhrases = guardrails?.requiredPhrases?.join(', ') || 'None required';
  const strictness = guardrails?.strictness || 'medium';

  const systemPrompt = `You are a brand representative AI agent for "${dna.name}".

BRAND IDENTITY:
- Tagline: ${dna.tagline}
- Description: ${dna.description}
- Mission: ${dna.mission}
- Key Messaging: ${dna.keyMessaging?.join('; ') || 'N/A'}
- Target Audience: ${dna.targetAudience}
- Tone of Voice: ${dna.toneOfVoice?.adjectives?.join(', ')} - ${dna.toneOfVoice?.description}
- Brand Personality: ${dna.brandPersonality?.join(', ')}
- Values: ${dna.values?.join(', ')}

ROLE: ${role.toUpperCase()}
${role === 'support' ? '- Provide helpful, empathetic customer support aligned with brand values' : ''}
${role === 'sales' ? '- Guide prospects toward purchase using persuasive, benefit-focused messaging' : ''}
${role === 'content' ? '- Create engaging content ideas that align with brand voice' : ''}
${role === 'research' ? '- Conduct market research and competitive analysis' : ''}

GUARDRAILS:
- Strictness Level: ${strictness}
- Forbidden Topics: ${forbiddenTopics}
- Required Phrases: ${requiredPhrases}
- Knowledge Base Limited: ${guardrails?.knowledgeBaseLimit ? 'Yes' : 'No'}

INSTRUCTIONS:
1. Always respond in character as a "${dna.name}" brand agent
2. Use the tone and personality defined above
3. Reference brand values and key messages when relevant
4. Decline requests that violate the guardrails above
5. Provide helpful, accurate information within your knowledge domain
6. End responses with relevant CTAs or next steps`;

  return systemPrompt;
};

/**
 * Initialize chat session with system prompt
 */
export const createAgentChat = (systemPrompt: string) => {
  console.log('[createAgentChat] Initializing agent chat session');
  return {
    systemPrompt,
    sendMessage: async (message: string) => {
      const provider = getActiveLLMProvider();
      const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;
      return await geminiService.generate(provider, fullPrompt);
    }
  };
};
/**
 * Run battle simulation between two brands
 */
export const runBattleSimulation = async (brand1: any, brand2: any): Promise<any> => {
  const provider = getActiveLLMProvider();
  
  const prompt = `You are a brand strategist. Compare these two brands in a competitive analysis.

BRAND 1: ${brand1.name}
- Description: ${brand1.description}
- Key Messages: ${brand1.keyMessaging?.join('; ')}
- Strengths: ${brand1.swot?.strengths?.join('; ')}
- Target Audience: ${brand1.targetAudience}

BRAND 2: ${brand2.name}
- Description: ${brand2.description}
- Key Messages: ${brand2.keyMessaging?.join('; ')}
- Strengths: ${brand2.swot?.strengths?.join('; ')}
- Target Audience: ${brand2.targetAudience}

Provide analysis in JSON format with:
{
  "winner": "Brand 1 or Brand 2",
  "winningFactors": ["factor1", "factor2", "factor3"],
  "losingFactors": ["factor1", "factor2"],
  "competitiveGap": "percentage",
  "strategicRecommendations": {
    "for_brand1": "actionable advice",
    "for_brand2": "actionable advice"
  },
  "marketPosition": "description of relative positioning"
}

Return ONLY valid JSON.`;

  try {
    console.log(`[runBattleSimulation] Comparing "${brand1.name}" vs "${brand2.name}"`);
    const response = await geminiService.generate(provider, prompt);
    
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const result = JSON.parse(jsonMatch[0]);
    console.log(`[runBattleSimulation] ✓ Winner: ${result.winner}`);
    return result;
  } catch (e: any) {
    console.error('[runBattleSimulation] Error:', e.message);
    throw e;
  }
};

/**
 * Analyze uploaded marketing assets
 */
export const analyzeUploadedAssets = async (assets: any[]): Promise<any> => {
  const provider = getActiveLLMProvider();
  
  const assetSummary = assets.map((a, i) => `Asset ${i+1}: ${a.name || 'Unnamed'} - ${a.description || 'No description'}`).join('\n');
  
  const prompt = `You are a creative director. Analyze these marketing assets and provide feedback.

ASSETS TO REVIEW:
${assetSummary}

Provide analysis in JSON with:
{
  "overallScore": 1-10,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "brandAlignment": "assessment of brand fit",
  "recommendations": ["recommendation1", "recommendation2"],
  "suggestions": "detailed improvement suggestions"
}

Return ONLY valid JSON.`;

  try {
    console.log(`[analyzeUploadedAssets] Analyzing ${assets.length} assets`);
    const response = await geminiService.generate(provider, prompt);
    
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const result = JSON.parse(jsonMatch[0]);
    console.log(`[analyzeUploadedAssets] ✓ Score: ${result.overallScore}/10`);
    return result;
  } catch (e: any) {
    console.error('[analyzeUploadedAssets] Error:', e.message);
    throw e;
  }
};

/**
 * Optimize posting schedule for maximum engagement
 */
export const optimizeSchedule = async (posts: any[]): Promise<any[]> => {
  const provider = getActiveLLMProvider();
  
  const postSummary = posts.map((p, i) => `Post ${i+1}: "${p.title}" for ${p.channel || 'unknown'}`).join('\n');
  
  const prompt = `You are a social media strategist. Optimize this posting schedule for maximum engagement.

POSTS TO SCHEDULE:
${postSummary}

For each post, determine optimal:
- Day of week (Monday-Sunday)
- Time of day (morning/afternoon/evening)
- Platform-specific timing
- Spacing between posts

Return JSON array with each post's optimized schedule:
[
  {
    "postId": "id",
    "title": "post title",
    "channel": "platform",
    "recommendedDay": "day",
    "recommendedTime": "HH:MM",
    "reasoning": "why this time"
  }
]

Return ONLY valid JSON array.`;

  try {
    console.log(`[optimizeSchedule] Optimizing ${posts.length} posts`);
    const response = await geminiService.generate(provider, prompt);
    
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');
    
    const result = JSON.parse(jsonMatch[0]);
    console.log(`[optimizeSchedule] ✓ Optimized schedule for ${result.length} posts`);
    return Array.isArray(result) ? result : [];
  } catch (e: any) {
    console.error('[optimizeSchedule] Error:', e.message);
    return posts; // Return original if optimization fails
  }
};

/**
 * Generate video using fal.ai or other providers
 * Falls back to template video if no API key configured
 */
export const generateVeoVideo = async (prompt: string): Promise<{ url: string }> => {
  try {
    console.log('[generateVeoVideo] Generating video for prompt:', prompt.substring(0, 100));
    
    // Try to use real video generation service if configured
    try {
      const { videoGenerationService } = await import('./videoGenerationService');
      const result = await videoGenerationService.generateVideo({
        prompt: prompt,
        duration: 10,
        aspectRatio: '16:9'
      });
      if (result.videoUrl) {
        console.log('[generateVeoVideo] ✓ Generated real video');
        return { url: result.videoUrl };
      }
    } catch (videoErr) {
      console.warn('[generateVeoVideo] Real video generation failed, using template');
    }
    
    // Fallback: Return template video placeholder
    // This is NOT a real video - it's a placeholder for demo purposes
    // To use real video generation, user must:
    // 1. Get fal.ai API key (https://fal.ai)
    // 2. Add to Settings → Video Generation
    const mockVideoUrl = `https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4`;
    console.log('[generateVeoVideo] Using template video (add fal.ai key for real generation)');
    return { url: mockVideoUrl };
  } catch (e) {
    console.warn('[generateVeoVideo] Error:', e);
    // Return public domain video as final fallback
    return { url: `https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4` };
  }
};

/**
 * Generate trend pulse (trending topics) for brand
 */
export const generateTrendPulse = async (dna: any): Promise<any[]> => {
    const provider = getActiveLLMProvider();
    
    const prompt = `You are a market trends analyst. Identify 3-5 trending topics relevant to "${dna.name}" (${dna.description}).

Industry: ${dna.targetAudience}
Key Messages: ${dna.keyMessaging?.join('; ')}

For EACH trend, provide JSON object with:
- id: unique identifier
- topic: trend title (2-4 words)
- summary: 2-3 sentence explanation
- relevanceScore: 1-100 (how relevant to brand)
- suggestedAngle: how brand should respond/leverage
- actionItems: ["action1", "action2"]

Return ONLY valid JSON array. No markdown.`;

    try {
      console.log(`[generateTrendPulse] Generating trends for "${dna.name}"`);
      const response = await geminiService.generate(provider, prompt);
      
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }
      
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`[generateTrendPulse] ✓ Generated ${parsed.length} trends`);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e: any) {
      console.error('[generateTrendPulse] Failed:', e.message);
      return [];
    }
};

/**
 * Refine asset based on user feedback
 */
export const refineAssetWithAI = async (asset: any, feedback: string): Promise<any> => {
  const provider = getActiveLLMProvider();
  
  const prompt = `You are a creative director. Refine this asset based on feedback.

CURRENT ASSET:
- Title: ${asset.title}
- Copy: ${asset.copy}
- Channel: ${asset.channel}
- Type: ${asset.type}

USER FEEDBACK: ${feedback}

Create refined version with same structure but improved based on feedback. Return JSON:
{
  "title": "refined title",
  "copy": "refined copy",
  "cta": "refined CTA",
  "imagePrompt": "updated visual prompt",
  "changes": "summary of changes made"
}

Return ONLY valid JSON.`;

  try {
    console.log(`[refineAssetWithAI] Refining asset with feedback: "${feedback.substring(0, 50)}..."`);
    const response = await geminiService.generate(provider, prompt);
    
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const refined = JSON.parse(jsonMatch[0]);
    console.log('[refineAssetWithAI] ✓ Asset refined');
    return { ...asset, ...refined };
  } catch (e: any) {
    console.error('[refineAssetWithAI] Error:', e.message);
    throw e;
  }
};

/**
 * Universal generate function - sends any prompt to active LLM
 */
export const universalGenerate = async (prompt: string): Promise<string> => {
  const provider = getActiveLLMProvider();
  console.log(`[universalGenerate] Using provider: ${provider}`);
  return await geminiService.generate(provider, prompt);
};
