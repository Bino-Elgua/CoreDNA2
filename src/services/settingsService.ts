/**
 * CoreDNA Settings Service
 * Manages nested API key storage with migration from legacy format
 * New format: { llms: { provider: { apiKey, enabled } }, image: {}, voice: {} }
 */

export interface ProviderConfig {
  apiKey: string;
  enabled?: boolean;
}

export interface SettingsData {
  activeLLM?: string;
  llms?: Record<string, ProviderConfig>;
  image?: Record<string, ProviderConfig>;
  voice?: Record<string, ProviderConfig>;
  [key: string]: any;
}

const SETTINGS_KEY = 'core_dna_settings';
const LEGACY_KEYS = 'apiKeys';

/**
 * Migrate legacy flat apiKeys to new nested format
 * Runs once on app load if old format detected
 */
export function migrateLegacyKeys(): void {
  const legacy = localStorage.getItem(LEGACY_KEYS);
  if (!legacy) return;

  try {
    const legacyKeys = JSON.parse(legacy);
    const settings = getSettings();

    // Map legacy keys to new structure
    for (const [provider, key] of Object.entries(legacyKeys)) {
      if (typeof key === 'string' && key.trim()) {
        // Initialize llms object if missing
        if (!settings.llms) settings.llms = {};

        // Migrate to new format
        if (!settings.llms[provider]) {
          settings.llms[provider] = {
            apiKey: key as string,
            enabled: true
          };
        }
      }
    }

    // Save migrated settings
    saveSettings(settings);

    // Remove legacy key after migration
    localStorage.removeItem(LEGACY_KEYS);

    console.log('✅ Migrated legacy API keys to new nested format');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

/**
 * Get all settings
 */
export function getSettings(): SettingsData {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error parsing settings:', error);
    return {};
  }
}

/**
 * Save settings to localStorage and Supabase
 */
export function saveSettings(settings: SettingsData): void {
  try {
    // Sanitize - ensure no empty keys
    if (settings.llms) {
      Object.entries(settings.llms).forEach(([provider, config]) => {
        if (!config.apiKey?.trim()) {
          delete settings.llms![provider];
        }
      });
    }
    if (settings.image) {
      Object.entries(settings.image).forEach(([provider, config]) => {
        if (!config.apiKey?.trim()) {
          delete settings.image![provider];
        }
      });
    }
    if (settings.voice) {
      Object.entries(settings.voice).forEach(([provider, config]) => {
        if (!config.apiKey?.trim()) {
          delete settings.voice![provider];
        }
      });
    }

    // Save to localStorage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    // TODO: Sync to Supabase if user authenticated
    // await supabase.from('user_settings').upsert({ ...settings })
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Get API key for specific provider
 * Checks new format first, then legacy as fallback
 */
export function getApiKey(provider: string): string | null {
  const settings = getSettings();

  // PRIORITY 1: Check new nested format
  if (settings.llms?.[provider]?.apiKey) {
    return settings.llms[provider].apiKey;
  }

  // PRIORITY 2: Check legacy flat format (warn user)
  const legacy = localStorage.getItem(LEGACY_KEYS);
  if (legacy) {
    try {
      const legacyKeys = JSON.parse(legacy);
      if (legacyKeys[provider]) {
        console.warn(
          `⚠️ Using legacy API key format for ${provider}. Please re-save in Settings for best performance.`
        );
        return legacyKeys[provider];
      }
    } catch (e) {
      console.error('Error reading legacy keys:', e);
    }
  }

  return null;
}

/**
 * Set API key for specific provider
 */
export function setApiKey(provider: string, key: string, category: 'llms' | 'image' | 'voice' = 'llms'): void {
  if (!key?.trim()) {
    throw new Error('API key cannot be empty');
  }

  const settings = getSettings();

  if (!settings[category]) {
    settings[category] = {};
  }

  settings[category][provider] = {
    apiKey: key.trim(),
    enabled: true
  };

  saveSettings(settings);
}

/**
 * Delete API key for specific provider
 */
export function deleteApiKey(provider: string, category: 'llms' | 'image' | 'voice' = 'llms'): void {
  const settings = getSettings();

  if (settings[category]?.[provider]) {
    delete settings[category][provider];
    saveSettings(settings);
  }
}

/**
 * Get active LLM provider
 */
export function getActiveLLMProvider(): string | null {
  const settings = getSettings();
  return settings.activeLLM || null;
}

/**
 * Set active LLM provider
 */
export function setActiveLLMProvider(provider: string): void {
  const settings = getSettings();

  // Verify provider has API key
  if (!settings.llms?.[provider]?.apiKey) {
    throw new Error(`No API key configured for ${provider}`);
  }

  settings.activeLLM = provider;
  saveSettings(settings);
}

/**
 * Get all configured LLM providers
 */
export function getConfiguredLLMProviders(): string[] {
  const settings = getSettings();
  return Object.keys(settings.llms || {}).filter(
    provider => settings.llms![provider].apiKey?.trim()
  );
}

/**
 * Check if provider has API key configured
 */
export function hasApiKey(provider: string, category: 'llms' | 'image' | 'voice' = 'llms'): boolean {
  const key = getApiKey(provider);
  return !!key?.trim();
}

/**
 * Get summary of all configured providers
 */
export function getConfigurationSummary(): {
  llmsConfigured: number;
  imageConfigured: number;
  voiceConfigured: number;
  activeLLM: string | null;
} {
  const settings = getSettings();

  return {
    llmsConfigured: Object.values(settings.llms || {}).filter(c => c.apiKey?.trim()).length,
    imageConfigured: Object.values(settings.image || {}).filter(c => c.apiKey?.trim()).length,
    voiceConfigured: Object.values(settings.voice || {}).filter(c => c.apiKey?.trim()).length,
    activeLLM: settings.activeLLM || null
  };
}
