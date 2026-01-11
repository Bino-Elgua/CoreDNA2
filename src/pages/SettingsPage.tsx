import { useState, useEffect } from 'react';
import { toastService } from '../services/toastService';
import { supabase } from '../services/supabase';
import { DPAModal } from '../components/DPAModal';
import { 
  getSettings, 
  saveSettings, 
  setApiKey, 
  deleteApiKey,
  getActiveLLMProvider,
  setActiveLLMProvider 
} from '../services/settingsService';
import { geminiService } from '../services/geminiService';

export function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('llm');
  const [healthChecking, setHealthChecking] = useState<Record<string, boolean>>({});
  const [healthStatus, setHealthStatus] = useState<Record<string, boolean>>({});

  // COMPLETE 70+ PROVIDER DEFINITIONS
  const providerCategories = {
    llm: {
      title: '🔤 LLM Providers (Text Generation)',
      description: 'Large Language Models for text generation, reasoning, and conversation',
      providers: [
        { id: 'gemini', name: 'Google Gemini', link: 'https://aistudio.google.com/apikey', recommended: true, free: true },
        { id: 'openai', name: 'OpenAI (GPT-4o, GPT-4)', link: 'https://platform.openai.com/api-keys' },
        { id: 'claude', name: 'Anthropic Claude 3.5', link: 'https://console.anthropic.com/settings/keys' },
        { id: 'mistral', name: 'Mistral AI', link: 'https://console.mistral.ai/api-keys' },
        { id: 'groq', name: 'Groq', link: 'https://console.groq.com/keys', free: true },
        { id: 'deepseek', name: 'DeepSeek', link: 'https://platform.deepseek.com/api_keys' },
        { id: 'xai', name: 'xAI (Grok)', link: 'https://console.x.ai/' },
        { id: 'perplexity', name: 'Perplexity', link: 'https://www.perplexity.ai/settings/api' },
        { id: 'openrouter', name: 'OpenRouter', link: 'https://openrouter.ai/keys' },
        { id: 'together', name: 'Together AI', link: 'https://api.together.xyz/settings/api-keys' },
        { id: 'qwen', name: 'Qwen (Alibaba)', link: 'https://dashscope.console.aliyun.com/' },
        { id: 'cohere', name: 'Cohere', link: 'https://dashboard.cohere.com/api-keys', free: true },
        { id: 'command_r', name: 'Command R+ (Cohere)', link: 'https://dashboard.cohere.com/api-keys' },
        { id: 'azure', name: 'Azure OpenAI', link: 'https://portal.azure.com/' },
        { id: 'ollama', name: 'Ollama (Local)', link: 'http://localhost:11434', local: true, free: true },
        { id: 'custom_llm', name: 'Custom/Local LLM', link: '', local: true }
      ]
    },
    image: {
      title: '🎨 Image Generators',
      description: 'AI image generation from text prompts',
      providers: [
        { id: 'imagen', name: 'Google Imagen 3', link: 'https://aistudio.google.com/apikey', recommended: true },
        { id: 'dalle', name: 'DALL-E 3 (OpenAI)', link: 'https://platform.openai.com/api-keys' },
        { id: 'dalle4', name: 'GPT Image 1.5 / DALL-E 4', link: 'https://platform.openai.com/api-keys' },
        { id: 'stability', name: 'Stability AI', link: 'https://platform.stability.ai/account/keys' },
        { id: 'sdxl', name: 'Stable Diffusion 3 / SDXL', link: 'https://platform.stability.ai/account/keys' },
        { id: 'fal', name: 'Fal.ai (Flux)', link: 'https://fal.ai/dashboard/keys' },
        { id: 'flux', name: 'Black Forest Labs (Flux)', link: 'https://blackforestlabs.ai/' },
        { id: 'midjourney', name: 'Midjourney (via Proxy)', link: 'https://www.midjourney.com/account/' },
        { id: 'runware', name: 'Runware', link: 'https://runware.ai/' },
        { id: 'leonardo', name: 'Leonardo.ai', link: 'https://app.leonardo.ai/' },
        { id: 'recraft', name: 'Recraft', link: 'https://www.recraft.ai/' },
        { id: 'xai_image', name: 'xAI Image', link: 'https://console.x.ai/' },
        { id: 'titan', name: 'Amazon Titan', link: 'https://console.aws.amazon.com/bedrock/' },
        { id: 'firefly', name: 'Adobe Firefly', link: 'https://developer.adobe.com/' },
        { id: 'deepai', name: 'DeepAI', link: 'https://deepai.org/' },
        { id: 'replicate_img', name: 'Replicate', link: 'https://replicate.com/account/api-tokens' },
        { id: 'segmind', name: 'Segmind', link: 'https://www.segmind.com/' },
        { id: 'bria', name: 'Bria', link: 'https://www.bria.ai/' },
        { id: 'prodia', name: 'Prodia', link: 'https://app.prodia.com/' },
        { id: 'ideogram', name: 'Ideogram', link: 'https://ideogram.ai/' },
        { id: 'wan', name: 'Wan', link: 'https://wan.ai/' },
        { id: 'hunyuan_img', name: 'Hunyuan Image', link: 'https://cloud.tencent.com/' }
      ]
    },
    voice: {
      title: '🔊 Voice / TTS Providers',
      description: 'Text-to-Speech and voice synthesis',
      providers: [
        { id: 'elevenlabs', name: 'ElevenLabs', link: 'https://elevenlabs.io/app/settings/api-keys', recommended: true },
        { id: 'openai_tts', name: 'OpenAI TTS', link: 'https://platform.openai.com/api-keys' },
        { id: 'playht', name: 'PlayHT', link: 'https://play.ht/app/api-access' },
        { id: 'cartesia', name: 'Cartesia (High Speed)', link: 'https://cartesia.ai/' },
        { id: 'deepgram', name: 'Deepgram', link: 'https://console.deepgram.com/' },
        { id: 'lmnt', name: 'LMNT', link: 'https://app.lmnt.com/' },
        { id: 'fish', name: 'Fish Audio', link: 'https://fish.audio/' },
        { id: 'rime', name: 'Rime', link: 'https://rime.ai/' },
        { id: 'neets', name: 'Neets', link: 'https://neets.ai/' },
        { id: 'speechify', name: 'Speechify', link: 'https://speechify.com/' },
        { id: 'polly', name: 'Amazon Polly', link: 'https://console.aws.amazon.com/polly/' },
        { id: 'google_tts', name: 'Google Cloud TTS', link: 'https://console.cloud.google.com/' },
        { id: 'azure_speech', name: 'Azure Speech', link: 'https://portal.azure.com/' },
        { id: 'piper', name: 'Piper (Local)', link: 'https://github.com/rhasspy/piper', local: true, free: true },
        { id: 'murf', name: 'Murf AI', link: 'https://murf.ai/' },
        { id: 'resemble', name: 'Resemble AI', link: 'https://www.resemble.ai/' },
        { id: 'wellsaid', name: 'WellSaid Labs', link: 'https://wellsaidlabs.com/' },
        { id: 'custom_tts', name: 'Custom TTS Endpoint', link: '', local: true }
      ]
    },
    automation: {
      title: '⚡ Automation / Workflows',
      description: 'Workflow automation and orchestration platforms',
      providers: [
        { id: 'n8n', name: 'n8n', link: 'http://localhost:5678', local: true, free: true, recommended: true },
        { id: 'zapier', name: 'Zapier', link: 'https://zapier.com/app/settings/api' },
        { id: 'make', name: 'Make.com', link: 'https://www.make.com/en/api-documentation' },
        { id: 'activepieces', name: 'ActivePieces', link: 'https://www.activepieces.com/' },
        { id: 'pipedream', name: 'Pipedream', link: 'https://pipedream.com/settings/account' },
        { id: 'relay', name: 'Relay.app', link: 'https://www.relay.app/' },
        { id: 'integrately', name: 'Integrately', link: 'https://integrately.com/' },
        { id: 'pabbly', name: 'Pabbly Connect', link: 'https://www.pabbly.com/connect/' },
        { id: 'tray', name: 'Tray.io', link: 'https://tray.io/' },
        { id: 'dify_auto', name: 'Dify.ai Workflows', link: 'https://cloud.dify.ai/' },
        { id: 'langchain', name: 'LangChain/LangGraph', link: 'https://python.langchain.com/' },
        { id: 'rag_webhook', name: 'Custom RAG Webhook', link: '', local: true }
      ]
    }
  };

  useEffect(() => {
    const settings = getSettings();
    
    // Flatten llms keys for display
    const allKeys: Record<string, string> = {};
    
    if (settings.llms) {
      Object.entries(settings.llms).forEach(([provider, config]) => {
        if (config.apiKey) {
          allKeys[provider] = config.apiKey;
        }
      });
    }
    
    if (settings.image) {
      Object.entries(settings.image).forEach(([provider, config]) => {
        if (config.apiKey) {
          allKeys[provider] = config.apiKey;
        }
      });
    }
    
    if (settings.voice) {
      Object.entries(settings.voice).forEach(([provider, config]) => {
        if (config.apiKey) {
          allKeys[provider] = config.apiKey;
        }
      });
    }
    
    setApiKeys(allKeys);
  }, []);

  const updateApiKey = async (provider: string, value: string) => {
    try {
      // Determine category based on provider
      let category: 'llms' | 'image' | 'voice' = 'llms';
      const imageProviders = ['imagen', 'dalle', 'dalle4', 'stability', 'sdxl', 'fal', 'flux', 'midjourney', 'runware', 'leonardo', 'recraft', 'xai_image', 'titan', 'firefly', 'deepai', 'replicate_img', 'segmind', 'bria', 'prodia', 'ideogram', 'wan', 'hunyuan_img'];
      const voiceProviders = ['elevenlabs', 'openai_tts', 'playht', 'cartesia', 'deepgram', 'lmnt', 'fish', 'rime', 'neets', 'speechify', 'polly', 'google_tts', 'azure_speech', 'piper', 'murf', 'resemble', 'wellsaid', 'custom_tts'];
      
      if (imageProviders.includes(provider)) category = 'image';
      else if (voiceProviders.includes(provider)) category = 'voice';

      // Save to new nested format
      setApiKey(provider, value, category);

      const updated = { ...apiKeys, [provider]: value };
      setApiKeys(updated);

      // Run health check for LLM providers
      if (category === 'llms') {
        setHealthChecking(prev => ({ ...prev, [provider]: true }));
        try {
          const healthy = await geminiService.healthCheck(provider);
          setHealthStatus(prev => ({ ...prev, [provider]: healthy }));
          
          if (healthy) {
            toastService.showToast(`✅ ${provider.toUpperCase()} key saved and tested`, 'success');
            
            // Auto-select as active provider if first one
            const currentActive = getActiveLLMProvider();
            if (!currentActive) {
              setActiveLLMProvider(provider);
              toastService.showToast(`🎯 ${provider.toUpperCase()} set as active provider`, 'info');
            }
          } else {
            toastService.showToast(`⚠️ ${provider.toUpperCase()} key saved but health check failed`, 'warning');
          }
        } catch (error) {
          console.error('Health check error:', error);
          toastService.showToast(`✅ ${provider.toUpperCase()} key saved`, 'success');
        } finally {
          setHealthChecking(prev => ({ ...prev, [provider]: false }));
        }
      } else {
        toastService.showToast(`✅ ${provider.toUpperCase()} key saved`, 'success');
      }
    } catch (error) {
      toastService.showToast(`❌ Failed to save ${provider.toUpperCase()} key`, 'error');
    }
  };

  const handleDeleteApiKey = (provider: string) => {
    try {
      // Determine category
      let category: 'llms' | 'image' | 'voice' = 'llms';
      const imageProviders = ['imagen', 'dalle', 'dalle4', 'stability', 'sdxl', 'fal', 'flux', 'midjourney', 'runware', 'leonardo', 'recraft', 'xai_image', 'titan', 'firefly', 'deepai', 'replicate_img', 'segmind', 'bria', 'prodia', 'ideogram', 'wan', 'hunyuan_img'];
      const voiceProviders = ['elevenlabs', 'openai_tts', 'playht', 'cartesia', 'deepgram', 'lmnt', 'fish', 'rime', 'neets', 'speechify', 'polly', 'google_tts', 'azure_speech', 'piper', 'murf', 'resemble', 'wellsaid', 'custom_tts'];
      
      if (imageProviders.includes(provider)) category = 'image';
      else if (voiceProviders.includes(provider)) category = 'voice';

      deleteApiKey(provider, category);
      
      const updated = { ...apiKeys };
      delete updated[provider];
      setApiKeys(updated);
      
      // Clear health status for this provider
      setHealthStatus(prev => ({ ...prev, [provider]: false }));
      
      toastService.showToast(`🗑️ ${provider.toUpperCase()} key removed`, 'info');
    } catch (error) {
      toastService.showToast(`❌ Failed to remove ${provider.toUpperCase()} key`, 'error');
    }
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const currentCategory = providerCategories[activeCategory as keyof typeof providerCategories];
  const categoryKeys = Object.keys(providerCategories) as Array<keyof typeof providerCategories>;

  const exportKeys = () => {
    const settings = getSettings();
    const exportData = {
      llms: settings.llms || {},
      image: settings.image || {},
      voice: settings.voice || {}
    };
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coredna-api-keys-backup.json';
    a.click();
    toastService.showToast('✅ API keys exported', 'success');
  };

  const importKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          const settings = getSettings();
          
          // Merge imported keys
          if (imported.llms) {
            settings.llms = { ...settings.llms, ...imported.llms };
          }
          if (imported.image) {
            settings.image = { ...settings.image, ...imported.image };
          }
          if (imported.voice) {
            settings.voice = { ...settings.voice, ...imported.voice };
          }
          
          saveSettings(settings);
          
          // Update display
          const allKeys: Record<string, string> = {};
          if (settings.llms) {
            Object.entries(settings.llms).forEach(([provider, config]) => {
              if (config.apiKey) allKeys[provider] = config.apiKey;
            });
          }
          if (settings.image) {
            Object.entries(settings.image).forEach(([provider, config]) => {
              if (config.apiKey) allKeys[provider] = config.apiKey;
            });
          }
          if (settings.voice) {
            Object.entries(settings.voice).forEach(([provider, config]) => {
              if (config.apiKey) allKeys[provider] = config.apiKey;
            });
          }
          setApiKeys(allKeys);
          
          toastService.showToast('✅ API keys imported', 'success');
        } catch (error) {
          toastService.showToast('❌ Invalid backup file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearAllKeys = () => {
    if (confirm('⚠️ This will delete ALL your API keys. Are you sure?')) {
      const settings = getSettings();
      settings.llms = {};
      settings.image = {};
      settings.voice = {};
      settings.activeLLM = undefined;
      saveSettings(settings);
      setApiKeys({});
      setHealthStatus({});
      toastService.showToast('🗑️ All API keys cleared', 'info');
    }
  };

  const [userTier, setUserTier] = useState<'free' | 'pro' | 'hunter' | 'agency'>('free');
  const [affiliateHubEnabled, setAffiliateHubEnabled] = useState(false);
  const [dpaAccepted, setDpaAccepted] = useState(false);
  const [showDPAModal, setShowDPAModal] = useState(false);
  const [partnerSlug, setPartnerSlug] = useState('');

  useEffect(() => {
    // Load user tier from auth/settings
    const loadUserTier = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get tier from user_settings or profile
        // For now, set to 'agency' to show Affiliate Hub
        setUserTier('agency');
      }
    };
    loadUserTier();
  }, []);

  const handleAffiliateHubToggle = (enabled: boolean) => {
    if (enabled && !dpaAccepted) {
      setShowDPAModal(true);
      return;
    }
    setAffiliateHubEnabled(enabled);
  };

  const handleDPAAccept = () => {
    setDpaAccepted(true);
    setAffiliateHubEnabled(true);
    setShowDPAModal(false);
  };

  return (
    <div className="settings-page max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Configure your API keys and preferences</p>

      {/* Category Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8">
          {categoryKeys.map(key => {
            const category = providerCategories[key];
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`
                  pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeCategory === key 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {category.title}
              </button>
            );
          })}
        </nav>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">{currentCategory.title}</h2>
          <p className="text-gray-600 mb-4">{currentCategory.description}</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🔒 BYOK - Bring Your Own Keys</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Your API keys, stored locally in your browser only</li>
              <li>✓ Never sent to CoreDNA servers</li>
              <li>✓ Direct API calls from your browser to providers</li>
              <li>✓ You control your data and costs</li>
            </ul>
          </div>
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCategory.providers.map(provider => {
            const hasKey = !!apiKeys[provider.id];

            return (
              <div
                key={provider.id}
                className={`
                  provider-key-card border rounded-lg p-4 transition-all
                  ${hasKey ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900">
                    {provider.name}
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {provider.recommended && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                        ⭐ Recommended
                      </span>
                    )}
                    {provider.free && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                        FREE
                      </span>
                    )}
                    {provider.local && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        Local
                      </span>
                    )}
                    {hasKey && (
                       <>
                         <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                           ✓ Configured
                         </span>
                         {healthStatus[provider.id] !== undefined && (
                           <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                             healthStatus[provider.id]
                               ? 'bg-emerald-100 text-emerald-700'
                               : 'bg-red-100 text-red-700'
                           }`}>
                             {healthStatus[provider.id] ? '✓ Healthy' : '✗ Failed'}
                           </span>
                         )}
                       </>
                     )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {provider.link && (
                    <a
                      href={provider.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline whitespace-nowrap"
                    >
                      Get Key →
                    </a>
                  )}
                </div>

                <div className="mt-2">
                  <input
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    value={apiKeys[provider.id] || ''}
                    onChange={(e) => updateApiKey(provider.id, e.target.value)}
                    placeholder={
                      provider.local
                        ? 'http://localhost:...'
                        : provider.id === 'azure'
                        ? 'Endpoint URL'
                        : 'API key'
                    }
                    className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => toggleShowKey(provider.id)}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm transition-colors"
                    title={showKeys[provider.id] ? 'Hide key' : 'Show key'}
                  >
                    {showKeys[provider.id] ? '🙈' : '👁️'}
                  </button>

                  {hasKey && (
                     <button
                       onClick={() => handleDeleteApiKey(provider.id)}
                       disabled={healthChecking[provider.id]}
                       className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       title="Remove key"
                     >
                       {healthChecking[provider.id] ? '⏳' : '🗑️'}
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-8">
          {categoryKeys.map(key => {
            const category = providerCategories[key];
            const configuredCount = category.providers.filter(p => apiKeys[p.id]).length;
            const totalCount = category.providers.length;

            return (
              <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl mb-1">{category.title.split(' ')[0]}</div>
                <div className="text-sm text-gray-600 mb-2">{category.title.split(' ').slice(1).join(' ')}</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {configuredCount}/{totalCount}
                  </div>
                  <div className="text-xs text-gray-500">Configured</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Export/Import Keys */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Backup & Restore</h3>
          <div className="flex gap-4">
            <button
              onClick={exportKeys}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              📥 Export Keys
            </button>

            <label className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors cursor-pointer">
              📤 Import Keys
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importKeys}
              />
            </label>

            <button
              onClick={clearAllKeys}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              🗑️ Clear All Keys
            </button>
          </div>
        </div>
      </div>

      {/* AFFILIATE HUB SECTION - AGENCY TIER ONLY */}
      {userTier === 'agency' && (
        <section className="affiliate-hub bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">🏢 Affiliate Hub (Agency Tier Exclusive)</h2>

            <div className="prose prose-sm max-w-none text-gray-600">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium">Enable Affiliate Hub</h3>
                  <p className="text-sm text-gray-600">
                    Create your referral page and start earning commissions
                  </p>
                </div>

                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={affiliateHubEnabled}
                      onChange={(e) => handleAffiliateHubToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {affiliateHubEnabled && dpaAccepted && (
                  <>
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6">
                      <h4 className="font-semibold text-emerald-900 mb-3">Your Affiliate Links</h4>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Branded Landing Page</p>
                          <div className="bg-white p-3 rounded flex items-center justify-between">
                            <code className="text-sm break-all">
                              https://partner.coredna.ai/{partnerSlug || 'your-slug'}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(`https://partner.coredna.ai/${partnerSlug}`)}
                              className="ml-3 px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Direct Referral Link</p>
                          <div className="bg-white p-3 rounded flex items-center justify-between">
                            <code className="text-sm break-all">
                              https://coredna.ai/r/{partnerSlug || 'your-id'}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(`https://coredna.ai/r/${partnerSlug}`)}
                              className="ml-3 px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => window.open(`https://partner.coredna.ai/${partnerSlug}`, '_blank')}
                              className="ml-3 px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                        <h4 className="font-semibold text-amber-900 mb-2">Compliance Summary</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>✓ Tiered consent banner (company ID / marketing / sales)</li>
                          <li>✓ Clearbit disclosed for IP enrichment</li>
                          <li>✓ Manual approval required for outreach</li>
                          <li>✓ You are data controller — CoreDNA is processor</li>
                          <li>✓ GDPR/CCPA/ePrivacy compliant</li>
                          <li>✓ Opt-out link on every page</li>
                        </ul>
                      </div>

                      <p className="text-xs text-emerald-800 mt-4">
                        Earn 20% recurring commission on all paid referrals — lifetime
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DPA Modal */}
      {showDPAModal && (
        <DPAModal 
          onAccept={handleDPAAccept} 
          onCancel={() => setShowDPAModal(false)}
        />
      )}
    </div>
  );
}
