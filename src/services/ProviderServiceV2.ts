import { callEdgeFunction } from '@/lib/supabaseClient';

export class ProviderService {
  // LLM Call - routes to Supabase edge function
  static async callLLM(request: {
    provider: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const response = await callEdgeFunction<any>('llm', {
      provider: request.provider,
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2048,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.content;
  }

  // Image Generation
  static async generateImage(request: {
    provider: string;
    model: string;
    prompt: string;
    size?: string;
    quality?: string;
  }): Promise<string> {
    const response = await callEdgeFunction<any>('image', {
      provider: request.provider,
      model: request.model,
      prompt: request.prompt,
      size: request.size ?? '1024x1024',
      quality: request.quality ?? 'standard',
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.imageUrl;
  }

  // Voice/TTS Generation
  static async generateVoice(request: {
    provider: string;
    model: string;
    text: string;
    voice?: string;
  }): Promise<string> {
    const response = await callEdgeFunction<any>('voice', {
      provider: request.provider,
      model: request.model,
      text: request.text,
      voice: request.voice,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.audioUrl;
  }

  // Video Generation
  static async generateVideo(request: {
    provider: string;
    model: string;
    prompt: string;
    duration?: number;
  }): Promise<string> {
    const response = await callEdgeFunction<any>('video', {
      provider: request.provider,
      model: request.model,
      prompt: request.prompt,
      duration: request.duration ?? 5,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.videoUrl || response.videoId;
  }
}

// API Key Manager - still uses localStorage for BYOK model
export class APIKeyManager {
  private static STORAGE_KEY = 'sonic_api_keys';

  static getKeys(): Record<string, Record<string, string>> {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) return {};
      const decrypted = atob(encrypted);
      return JSON.parse(decrypted);
    } catch {
      return {};
    }
  }

  static setKeys(keys: Record<string, Record<string, string>>): void {
    const encrypted = btoa(JSON.stringify(keys));
    localStorage.setItem(this.STORAGE_KEY, encrypted);
  }

  static getKey(providerId: string, category: string): string | null {
    const keys = this.getKeys();
    return keys[category]?.[providerId] || null;
  }

  static setKey(providerId: string, category: string, apiKey: string): void {
    const keys = this.getKeys();
    if (!keys[category]) keys[category] = {};
    keys[category][providerId] = apiKey;
    this.setKeys(keys);
  }

  static deleteKey(providerId: string, category: string): void {
    const keys = this.getKeys();
    if (keys[category]) {
      delete keys[category][providerId];
      this.setKeys(keys);
    }
  }

  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
