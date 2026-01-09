import React, { useState, useEffect } from 'react';
import { toastService } from '../services/toastService';

interface VideoProvider {
  id: string;
  name: string;
  emoji: string;
  category: 'premium' | 'affordable' | 'avatar' | 'platform';
  tier: 'free' | 'pro' | 'hunter' | 'agency';
  link: string;
  strengths: string[];
  useCase?: string;
  costEstimate?: string;
  apiType: 'rest' | 'webhook' | 'sdk' | 'hosted';
  description: string;
  maxDuration?: string;
  outputFormat?: string;
}

interface ProviderCategory {
  title: string;
  description: string;
  providers: VideoProvider[];
}

const videoProviderCategories = {
  premium: {
    title: '🎬 Premium / Top-Tier (Hunter+ Recommended)',
    description: 'Cinematic quality, best-in-class realism and coherence',
    providers: [
       {
         id: 'sora2',
         name: 'OpenAI — Sora 2',
         emoji: '🎬',
         category: 'premium',
        tier: 'hunter',
        link: 'https://platform.openai.com/docs/guides/vision',
        strengths: ['Best-in-class realism', 'Physics accuracy', 'Narrative coherence', 'Emotional storytelling'],
        useCase: 'High-production shorts & emotional storytelling',
        costEstimate: '$0.10–0.50/sec',
        apiType: 'rest',
        description: 'Superior motion, multi-scene capability, native audio support',
        maxDuration: '60 seconds',
        outputFormat: '1080p, 4K'
      },
      {
        id: 'veo3',
        name: 'Google — Veo 3 / Veo 3.1',
        emoji: '🌟',
        category: 'premium',
        tier: 'hunter',
        link: 'https://cloud.google.com/vertex-ai/docs',
        strengths: ['Professional-grade vertical videos', 'Superior motion', 'Multi-scene support', 'Native audio'],
        useCase: 'Professional-grade vertical videos',
        costEstimate: '$0.20–0.40/sec',
        apiType: 'rest',
        description: 'Vertex AI / Gemini API integration',
        maxDuration: '60 seconds',
        outputFormat: '1080p, 4K'
      }
    ]
  },
  affordable: {
    title: '🎨 Affordable / Open-Source (Free/Pro Friendly)',
    description: 'Fast, cheap, and accessible for all tiers',
    providers: [
      {
        id: 'runway',
        name: 'Runway — Gen-4 / Gen-3 Turbo',
        emoji: '🚀',
        category: 'affordable',
        tier: 'pro',
        link: 'https://www.runwayml.com/',
        strengths: ['Motion brush', 'Editing controls', 'Lip-sync', 'Precise creative control'],
        useCase: 'Precise creative control',
        costEstimate: 'Credit-based',
        apiType: 'rest',
        description: 'Official Runway API with motion control',
        maxDuration: '120 seconds',
        outputFormat: '1080p, 4K'
      },
      {
        id: 'kling',
        name: 'Kling AI — Kling 2.6 / 2.0',
        emoji: '✨',
        category: 'affordable',
        tier: 'pro',
        link: 'https://klingai.com/',
        strengths: ['Realistic human motion', 'Longer clips', 'Character-driven shorts'],
        useCase: 'Character-driven shorts',
        costEstimate: 'API available via third-party hosts',
        apiType: 'hosted',
        description: 'Available via WaveSpeedAI and other platforms',
        maxDuration: '120 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'luma',
        name: 'Luma AI — Dream Machine (Ray 3)',
        emoji: '🌀',
        category: 'affordable',
        tier: 'pro',
        link: 'https://lumalabs.ai/',
        strengths: ['Photorealistic image-to-video', 'Stunning visuals from static images'],
        useCase: 'Stunning visuals from static campaign images',
        costEstimate: 'Replicate / fal.ai hosting',
        apiType: 'hosted',
        description: 'Best for converting images to video',
        maxDuration: '60 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'ltx2',
        name: 'Lightricks — LTX-2 (Open-source)',
        emoji: '⚡',
        category: 'affordable',
        tier: 'free',
        link: 'https://www.lightricks.com/ltx',
        strengths: ['Native synced audio + video', 'Fast image-to-video', '4K/50fps', 'Default for social shorts'],
        useCase: 'Default for social shorts — recommended starting point',
        costEstimate: '$0.04–0.16/sec',
        apiType: 'hosted',
        description: 'Replicate / fal.ai hosting with audio sync',
        maxDuration: '60 seconds',
        outputFormat: '4K, 50fps'
      },
      {
        id: 'wan',
        name: 'Wan 2.6 / Wan 2.2 (Open-source)',
        emoji: '🌊',
        category: 'affordable',
        tier: 'free',
        link: 'https://github.com/1div0/wanx',
        strengths: ['Good motion', 'MoE efficiency', 'Open-source'],
        useCase: 'Efficient video generation',
        costEstimate: 'Replicate / fal.ai hosting',
        apiType: 'hosted',
        description: 'Open-source model with MoE architecture',
        maxDuration: '60 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'hunyuan',
        name: 'HunyuanVideo (Tencent open-source)',
        emoji: '🎯',
        category: 'affordable',
        tier: 'free',
        link: 'https://github.com/Tencent/HunyuanVideo',
        strengths: ['Good motion', 'MoE efficiency', 'Emerging on platforms'],
        useCase: 'Enterprise video generation',
        costEstimate: 'Emerging on Replicate / Together.ai',
        apiType: 'hosted',
        description: 'Tencent open-source model',
        maxDuration: '60 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'mochi',
        name: 'Mochi (Genmo open-source)',
        emoji: '🍡',
        category: 'affordable',
        tier: 'free',
        link: 'https://github.com/genmo-ai/Mochi',
        strengths: ['Cinematic quality', '13B+ params', 'Customizable'],
        useCase: 'Cinematic video generation',
        costEstimate: 'fal.ai / Fireworks hosting',
        apiType: 'hosted',
        description: 'Open-source model with cinematic capabilities',
        maxDuration: '90 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'seedance',
        name: 'Seedance 1.5 Pro',
        emoji: '🌱',
        category: 'affordable',
        tier: 'pro',
        link: 'https://www.seedance.com/',
        strengths: ['Customizable', 'Strong stylization', 'Product demos', 'Clean UGC style'],
        useCase: 'Product demos & UGC-style content',
        costEstimate: 'API available via platforms',
        apiType: 'hosted',
        description: 'Modal / Hugging Face Spaces',
        maxDuration: '60 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'pika',
        name: 'Pika Labs — Pika 2.2',
        emoji: '🎨',
        category: 'affordable',
        tier: 'pro',
        link: 'https://pika.art/',
        strengths: ['Quick iterations', 'Fun effects', 'Fast dreamy visuals'],
        useCase: 'Creative shorts with effects',
        costEstimate: 'Official API access',
        apiType: 'rest',
        description: 'Web-based with official API',
        maxDuration: '120 seconds',
        outputFormat: '1080p, 4K'
      },
      {
        id: 'hailuo',
        name: 'Hailuo 2.3 (MiniMax)',
        emoji: '🎭',
        category: 'affordable',
        tier: 'pro',
        link: 'https://www.hailuo.ai/',
        strengths: ['Fast dreamy visuals', 'Budget-friendly'],
        useCase: 'Fast iteration & creative exploration',
        costEstimate: 'Third-party hosts',
        apiType: 'hosted',
        description: 'Available via third-party platforms',
        maxDuration: '60 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'pixverse',
        name: 'Pixverse',
        emoji: '🖼️',
        category: 'affordable',
        tier: 'free',
        link: 'https://www.pixverse.ai/',
        strengths: ['Budget-friendly', 'Clean output', 'Easy integration'],
        useCase: 'Budget-friendly video generation',
        costEstimate: 'API supported',
        apiType: 'rest',
        description: 'Official API access available',
        maxDuration: '60 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'higgsfield',
        name: 'Higgsfield',
        emoji: '🌠',
        category: 'affordable',
        tier: 'pro',
        link: 'https://www.higgsfield.ai/',
        strengths: ['Cinematic camera moves', 'Creative control'],
        useCase: 'Cinematic shots with camera movement',
        costEstimate: 'Emerging API',
        apiType: 'rest',
        description: 'Emerging API with cinematic focus',
        maxDuration: '60 seconds',
        outputFormat: '1080p'
      }
    ]
  },
  avatar: {
    title: '👤 Avatar / Talking-Head (Explainer & Spokesperson)',
    description: 'Professional avatars and talking-head videos',
    providers: [
      {
        id: 'heygen',
        name: 'HeyGen',
        emoji: '👤',
        category: 'avatar',
        tier: 'pro',
        link: 'https://www.heygen.com/api',
        strengths: ['Professional avatars', 'Multilingual support', 'Script-to-video'],
        useCase: 'Professional avatar videos & explainers',
        costEstimate: 'Full REST API',
        apiType: 'rest',
        description: 'Industry-leading avatar platform',
        maxDuration: '300 seconds',
        outputFormat: '1080p'
      },
      {
        id: 'synthesia',
        name: 'Synthesia',
        emoji: '🎬',
        category: 'avatar',
        tier: 'pro',
        link: 'https://www.synthesia.io/api',
        strengths: ['Professional avatars', 'Multilingual', 'Enterprise-ready'],
        useCase: 'Enterprise avatar video production',
        costEstimate: 'Robust developer API',
        apiType: 'rest',
        description: 'Enterprise avatars & video production',
        maxDuration: '300 seconds',
        outputFormat: '1080p, 4K'
      },
      {
        id: 'deepbrain',
        name: 'DeepBrain AI',
        emoji: '🧠',
        category: 'avatar',
        tier: 'pro',
        link: 'https://www.deepbrainai.io/api',
        strengths: ['Hyper-realistic avatars', 'Training-focused', 'Enterprise ready'],
        useCase: 'Hyper-realistic spokesperson videos',
        costEstimate: 'Available API',
        apiType: 'rest',
        description: 'Advanced avatar technology',
        maxDuration: '300 seconds',
        outputFormat: '1080p, 4K'
      },
      {
        id: 'colossyan',
        name: 'Colossyan',
        emoji: '📚',
        category: 'avatar',
        tier: 'pro',
        link: 'https://www.colossyan.com/api',
        strengths: ['Hyper-realistic avatars', 'Training-focused avatars'],
        useCase: 'Training & educational videos with avatars',
        costEstimate: 'API supported',
        apiType: 'rest',
        description: 'Focus on training and education',
        maxDuration: '300 seconds',
        outputFormat: '1080p'
      }
    ]
  },
  platform: {
    title: '🌐 Multi-Model Hosting Platforms',
    description: 'One API key → access to many video models',
    providers: [
      {
        id: 'replicate',
        name: 'Replicate',
        emoji: '🔄',
        category: 'platform',
        tier: 'free',
        link: 'https://replicate.com/api',
        strengths: ['Hosts LTX-2', 'Luma', 'Runway', 'Kling variants', 'Open models', 'Pay-per-use'],
        useCase: 'Multi-model access for all tiers',
        costEstimate: 'Pay-per-use',
        apiType: 'rest',
        description: 'Unified API for multiple video generation models',
        maxDuration: 'Model-dependent',
        outputFormat: 'Variable'
      },
      {
        id: 'fal',
        name: 'fal.ai',
        emoji: '✨',
        category: 'platform',
        tier: 'free',
        link: 'https://fal.ai/dashboard',
        strengths: ['Easy integration', 'LTX-2 hosting', 'Luma support', 'Runway variants', 'Kling models', 'Open-source options'],
        useCase: 'Easy integration with multiple models',
        costEstimate: 'Pay-per-use (~$0.04–0.16/sec)',
        apiType: 'rest',
        description: 'Multi-model hosting with simple API',
        maxDuration: 'Model-dependent',
        outputFormat: 'Variable'
      },
      {
        id: 'fireworks',
        name: 'Fireworks.ai / Together.ai',
        emoji: '🔥',
        category: 'platform',
        tier: 'free',
        link: 'https://fireworks.ai/',
        strengths: ['Fast inference', 'LTX-2 proxy', 'Veo proxies', 'Open-source models', 'Great for speed'],
        useCase: 'Speed-optimized multi-model access',
        costEstimate: 'Fast inference for all models',
        apiType: 'rest',
        description: 'Performance-focused model hosting',
        maxDuration: 'Model-dependent',
        outputFormat: 'Variable'
      },
      {
        id: 'wavespeed',
        name: 'WaveSpeedAI / Runware',
        emoji: '⚙️',
        category: 'platform',
        tier: 'pro',
        link: 'https://wavespeed.io/',
        strengths: ['Kling aggregation', 'Seedance access', 'WAN models', 'Good for scaling', 'Aggregated access'],
        useCase: 'Load balancing & scaling',
        costEstimate: 'Scaling-optimized',
        apiType: 'rest',
        description: 'Aggregated access to multiple providers',
        maxDuration: 'Model-dependent',
        outputFormat: 'Variable'
      }
    ]
  }
};

export function VideoProvidersSection() {
  const [activeCategory, setActiveCategory] = useState<keyof typeof videoProviderCategories>('affordable');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('videoProviderKeys');
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse video provider keys:', e);
      }
    }
  }, []);

  const updateApiKey = (provider: string, value: string) => {
    const updated = { ...apiKeys, [provider]: value };
    setApiKeys(updated);
    localStorage.setItem('videoProviderKeys', JSON.stringify(updated));
    toastService.showToast(`✅ ${provider.toUpperCase()} key saved`, 'success');
  };

  const deleteApiKey = (provider: string) => {
    const updated = { ...apiKeys };
    delete updated[provider];
    setApiKeys(updated);
    localStorage.setItem('videoProviderKeys', JSON.stringify(updated));
    toastService.showToast(`🗑️ ${provider.toUpperCase()} key removed`, 'info');
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const currentCategory = videoProviderCategories[activeCategory];
  const categoryKeys = Object.keys(videoProviderCategories) as Array<keyof typeof videoProviderCategories>;

  // Summary stats
  const stats = categoryKeys.map(key => {
    const category = videoProviderCategories[key];
    const configuredCount = category.providers.filter(p => apiKeys[p.id]).length;
    const totalCount = category.providers.length;
    return { key, category, configuredCount, totalCount };
  });

  const getTierBadge = (tier: string) => {
    const colors = {
      free: 'bg-green-100 text-green-700',
      pro: 'bg-blue-100 text-blue-700',
      hunter: 'bg-purple-100 text-purple-700',
      agency: 'bg-red-100 text-red-700'
    };
    return colors[tier as keyof typeof colors] || colors.free;
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {categoryKeys.map(key => {
            const category = videoProviderCategories[key];
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeCategory === key 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.title.split(' ').slice(0, 1).join(' ')}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ key, category, configuredCount, totalCount }) => {
          return (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{category.title.split(' / ')[0]}</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-purple-600">{configuredCount}/{totalCount}</div>
                <div className="text-xs text-gray-500">Configured</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Info Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">{currentCategory.title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{currentCategory.description}</p>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">🎬 Video Generation Setup</h3>
            <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
              <li>✓ Add API keys for your preferred video generation providers</li>
              <li>✓ Keys stored locally in your browser only</li>
              <li>✓ Never sent to CoreDNA servers</li>
              <li>✓ You control your data and costs</li>
            </ul>
          </div>
        </div>

        {/* Integration Roadmap */}
        <div className="mb-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">📋 Recommended Integration Order</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <span className="font-bold text-purple-600 min-w-fit">Phase 1:</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Replicate</strong> or <strong>fal.ai</strong> → LTX-2 (free/pro tiers)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-purple-600 min-w-fit">Phase 2:</span>
              <span className="text-gray-700 dark:text-gray-300">Add <strong>Sora 2</strong> and <strong>Veo 3</strong> as premium options (Hunter+)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-purple-600 min-w-fit">Phase 3:</span>
              <span className="text-gray-700 dark:text-gray-300">Gradually add <strong>HeyGen/Synthesia</strong> for avatar videos</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-purple-600 min-w-fit">Phase 4:</span>
              <span className="text-gray-700 dark:text-gray-300">Use multi-host platforms as fallback/load balancing</span>
            </div>
          </div>
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCategory.providers.map(provider => {
            const hasKey = !!apiKeys[provider.id];
            return (
              <div 
                key={provider.id} 
                className={`provider-card border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                  hasKey ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                } ${activeProvider === provider.id ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setActiveProvider(activeProvider === provider.id ? null : provider.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      <span className="text-lg mr-1">{provider.emoji}</span> {provider.name}
                    </label>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTierBadge(provider.tier)}`}>
                      {provider.tier.toUpperCase()}
                    </span>
                    {hasKey && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                        ✓ Configured
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    value={apiKeys[provider.id] || ''}
                    onChange={(e) => updateApiKey(provider.id, e.target.value)}
                    placeholder="API key"
                    className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    onClick={(e) => e.stopPropagation()}
                  />

                  {hasKey && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShowKey(provider.id);
                        }}
                        title={showKeys[provider.id] ? 'Hide key' : 'Show key'}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
                      >
                        {showKeys[provider.id] ? '🙈' : '👁️'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteApiKey(provider.id);
                        }}
                        title="Remove key"
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>

                {/* Expanded Details */}
                {activeProvider === provider.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description</h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{provider.description}</p>
                    </div>

                    {provider.useCase && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Use Case</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{provider.useCase}</p>
                      </div>
                    )}

                    {provider.costEstimate && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Cost</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{provider.costEstimate}</p>
                      </div>
                    )}

                    {provider.strengths.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Strengths</h4>
                        <div className="flex flex-wrap gap-1">
                          {provider.strengths.slice(0, 3).map((strength, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {provider.maxDuration && (
                        <div>
                          <h5 className="font-semibold text-gray-600 dark:text-gray-400">Max Duration</h5>
                          <p className="text-gray-700 dark:text-gray-300">{provider.maxDuration}</p>
                        </div>
                      )}
                      {provider.outputFormat && (
                        <div>
                          <h5 className="font-semibold text-gray-600 dark:text-gray-400">Output</h5>
                          <p className="text-gray-700 dark:text-gray-300">{provider.outputFormat}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {provider.link && (
                  <a 
                    href={provider.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-purple-500 hover:underline inline-block mt-2"
                  >
                    Get API Access →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Backup & Restore Video Keys</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => {
              const data = JSON.stringify(apiKeys, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'coredna-video-keys-backup.json';
              a.click();
              toastService.showToast('✅ Video keys exported', 'success');
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
          >
            📥 Export Keys
          </button>

          <label className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors cursor-pointer text-sm">
            📤 Import Keys
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const imported = JSON.parse(event.target?.result as string);
                      setApiKeys(imported);
                      localStorage.setItem('videoProviderKeys', JSON.stringify(imported));
                      toastService.showToast('✅ Video keys imported', 'success');
                    } catch (error) {
                      toastService.showToast('❌ Invalid backup file', 'error');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>

          <button
            onClick={() => {
              if (confirm('⚠️ This will delete ALL your video provider API keys. Are you sure?')) {
                localStorage.removeItem('videoProviderKeys');
                setApiKeys({});
                toastService.showToast('🗑️ All video keys cleared', 'info');
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            🗑️ Clear All Keys
          </button>
        </div>
      </div>
    </div>
  );
}
