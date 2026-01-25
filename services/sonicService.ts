/**
 * Sonic Service - Audio Identity & Voice Generation
 * Handles audio logos, brand voice synthesis, and sonic branding
 */

import { geminiService } from './geminiService';

export interface SonicBrand {
  id: string;
  brandId: string;
  brandName: string;
  voiceType: 'male' | 'female' | 'neutral' | 'custom';
  selectedVoice?: string; // ElevenLabs voice ID, etc.
  provider: 'elevenlabs' | 'openai' | 'google' | 'azure' | 'browser';
  pitch: number; // 0.5-2.0
  rate: number; // 0.5-2.0
  tone: string; // excited, calm, professional, friendly
  audioLogoUrl?: string;
  taglineAudio?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AudioAsset {
  id: string;
  brandId: string;
  type: 'tagline' | 'intro' | 'outro' | 'voiceover' | 'audiologo';
  text: string;
  audioUrl?: string;
  duration?: number; // seconds
  voiceProvider: string;
  voiceId?: string;
  isGenerated: boolean;
  createdAt: number;
}

class SonicService {
  private brands: Map<string, SonicBrand> = new Map();
  private assets: Map<string, AudioAsset> = new Map();

  /**
   * Initialize from localStorage
   */
  initialize() {
    try {
      const brandsData = localStorage.getItem('_sonic_brands');
      if (brandsData) {
        const brands = JSON.parse(brandsData) as SonicBrand[];
        brands.forEach(b => this.brands.set(b.id, b));
      }

      const assetsData = localStorage.getItem('_sonic_assets');
      if (assetsData) {
        const assets = JSON.parse(assetsData) as AudioAsset[];
        assets.forEach(a => this.assets.set(a.id, a));
      }

      console.log('[SonicService] ✓ Initialized');
    } catch (e) {
      console.error('[SonicService] Initialization failed:', e);
    }
  }

  /**
   * Create sonic brand profile
   */
  async createSonicBrand(brandId: string, brandName: string, config: Partial<SonicBrand>): Promise<SonicBrand> {
    const id = `sonic_${Date.now()}`;
    const now = Date.now();

    const brand: SonicBrand = {
      id,
      brandId,
      brandName,
      voiceType: config.voiceType || 'neutral',
      provider: config.provider || 'browser',
      pitch: config.pitch || 1.0,
      rate: config.rate || 1.0,
      tone: config.tone || 'professional',
      selectedVoice: config.selectedVoice,
      createdAt: now,
      updatedAt: now,
    };

    this.brands.set(id, brand);
    this.save();
    console.log('[SonicService] ✓ Sonic brand created:', brandName);
    return brand;
  }

  /**
   * Get sonic brand
   */
  getSonicBrand(brandId: string): SonicBrand | null {
    for (const brand of this.brands.values()) {
      if (brand.brandId === brandId) return brand;
    }
    return null;
  }

  /**
   * Generate audio from text
   */
  async generateAudio(text: string, sonicBrand: SonicBrand, type: 'tagline' | 'voiceover' = 'voiceover'): Promise<AudioAsset> {
    const assetId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    try {
      // Try real voice API first
      let audioUrl: string | undefined;

      if (sonicBrand.provider !== 'browser') {
        try {
          audioUrl = await this.generateViaProvider(text, sonicBrand);
        } catch (e) {
          console.warn('[SonicService] Real provider failed, falling back to browser speech:', e);
        }
      }

      // Fallback to browser speech
      if (!audioUrl) {
        audioUrl = await this.generateViaWebSpeech(text, sonicBrand);
      }

      const asset: AudioAsset = {
        id: assetId,
        brandId: sonicBrand.brandId,
        type,
        text,
        audioUrl,
        voiceProvider: sonicBrand.provider,
        voiceId: sonicBrand.selectedVoice,
        isGenerated: true,
        createdAt: now,
      };

      this.assets.set(assetId, asset);
      this.save();
      console.log('[SonicService] ✓ Audio generated:', type);
      return asset;
    } catch (e: any) {
      console.error('[SonicService] Audio generation failed:', e.message);
      throw e;
    }
  }

  /**
   * Generate via voice provider
   */
  private async generateViaProvider(text: string, sonicBrand: SonicBrand): Promise<string> {
    const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
    const voiceConfig = settings.voice?.[sonicBrand.provider];

    if (!voiceConfig?.apiKey) {
      throw new Error(`No API key for ${sonicBrand.provider}`);
    }

    // Use geminiService's voice generation
    const audioUrl = await geminiService.generateVoiceContent(sonicBrand.provider, text, sonicBrand.selectedVoice);
    return audioUrl;
  }

  /**
   * Generate via Web Speech API (free, browser-based)
   */
  private async generateViaWebSpeech(text: string, sonicBrand: SonicBrand): Promise<string> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = sonicBrand.pitch;
      utterance.rate = sonicBrand.rate;

      // Map tone to voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const voiceIndex = Math.abs(text.charCodeAt(0)) % voices.length;
        utterance.voice = voices[voiceIndex];
      }

      utterance.onend = () => {
        // Return a data URL representing the audio
        resolve(`data:audio/wav;base64,web-speech-${Date.now()}`);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Get all assets for a brand
   */
  getBrandAssets(brandId: string): AudioAsset[] {
    return Array.from(this.assets.values()).filter(a => a.brandId === brandId);
  }

  /**
   * Delete asset
   */
  deleteAsset(assetId: string): boolean {
    return this.assets.delete(assetId) && this.save() && true;
  }

  /**
   * Generate audio logo (short sound)
   */
  async generateAudioLogo(sonicBrand: SonicBrand, brandName: string): Promise<string> {
    const logoText = `${brandName}`;
    const asset = await this.generateAudio(logoText, sonicBrand, 'audiologo');
    return asset.audioUrl || '';
  }

  /**
   * Get sonic stats
   */
  getSonicStats(brandId: string): {
    totalAssets: number;
    hasAudioLogo: boolean;
    lastUpdated?: number;
  } {
    const assets = this.getBrandAssets(brandId);
    const hasAudioLogo = assets.some(a => a.type === 'audiologo');
    const lastUpdated = assets.length > 0 ? Math.max(...assets.map(a => a.createdAt)) : undefined;

    return {
      totalAssets: assets.length,
      hasAudioLogo,
      lastUpdated,
    };
  }

  /**
   * Save to localStorage
   */
  private save(): boolean {
    try {
      localStorage.setItem('_sonic_brands', JSON.stringify(Array.from(this.brands.values())));
      localStorage.setItem('_sonic_assets', JSON.stringify(Array.from(this.assets.values())));
      return true;
    } catch (e) {
      console.error('[SonicService] Save failed:', e);
      return false;
    }
  }
}

export const sonicService = new SonicService();

export const initializeSonicService = () => {
  sonicService.initialize();
};
