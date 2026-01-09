/**
 * Video Generation Providers Configuration
 * CoreDNA Video Generation Providers (January 2026)
 */

export type VideoProviderCategory = 'premium' | 'affordable' | 'avatar' | 'platform';
export type VideoTier = 'free' | 'pro' | 'hunter' | 'agency';
export type APIType = 'rest' | 'webhook' | 'sdk' | 'hosted';

export interface VideoProvider {
  id: string;
  name: string;
  category: VideoProviderCategory;
  tier: VideoTier;
  link: string;
  strengths: string[];
  useCase?: string;
  costEstimate?: string;
  apiType: APIType;
  description: string;
  maxDuration?: string;
  outputFormat?: string;
  recommendedFor?: string[];
  models?: string[];
}

// Premium / Top-Tier (Hunter+ Recommended)
export const PREMIUM_PROVIDERS: VideoProvider[] = [
  {
    id: 'sora2',
    name: 'OpenAI — Sora 2',
    category: 'premium',
    tier: 'hunter',
    link: 'https://platform.openai.com/docs/guides/vision',
    strengths: ['Best-in-class realism', 'Physics accuracy', 'Narrative coherence', 'Emotional storytelling'],
    useCase: 'High-production shorts & emotional storytelling',
    costEstimate: '$0.10–0.50/sec',
    apiType: 'rest',
    description: 'Superior motion, multi-scene capability, native audio support',
    maxDuration: '60 seconds',
    outputFormat: '1080p, 4K',
    recommendedFor: ['brand_films', 'storytelling', 'commercial'],
    models: ['Sora 2']
  },
  {
    id: 'veo3',
    name: 'Google — Veo 3 / Veo 3.1',
    category: 'premium',
    tier: 'hunter',
    link: 'https://cloud.google.com/vertex-ai/docs',
    strengths: ['Professional-grade vertical videos', 'Superior motion', 'Multi-scene support', 'Native audio'],
    useCase: 'Professional-grade vertical videos',
    costEstimate: '$0.20–0.40/sec',
    apiType: 'rest',
    description: 'Vertex AI / Gemini API integration',
    maxDuration: '60 seconds',
    outputFormat: '1080p, 4K',
    recommendedFor: ['shorts', 'social_content', 'professional_video'],
    models: ['Veo 3', 'Veo 3.1']
  }
];

// Affordable / Open-Source (Free/Pro Friendly)
export const AFFORDABLE_PROVIDERS: VideoProvider[] = [
  {
    id: 'runway',
    name: 'Runway — Gen-4 / Gen-3 Turbo',
    category: 'affordable',
    tier: 'pro',
    link: 'https://www.runwayml.com/',
    strengths: ['Motion brush', 'Editing controls', 'Lip-sync', 'Precise creative control'],
    useCase: 'Precise creative control',
    costEstimate: 'Credit-based',
    apiType: 'rest',
    description: 'Official Runway API with motion control',
    maxDuration: '120 seconds',
    outputFormat: '1080p, 4K',
    recommendedFor: ['creative_control', 'editing', 'motion'],
    models: ['Gen-4', 'Gen-3 Turbo']
  },
  {
    id: 'kling',
    name: 'Kling AI — Kling 2.6 / 2.0',
    category: 'affordable',
    tier: 'pro',
    link: 'https://klingai.com/',
    strengths: ['Realistic human motion', 'Longer clips', 'Character-driven shorts'],
    useCase: 'Character-driven shorts',
    costEstimate: 'API available via third-party hosts',
    apiType: 'hosted',
    description: 'Available via WaveSpeedAI and other platforms',
    maxDuration: '120 seconds',
    outputFormat: '1080p',
    recommendedFor: ['character_video', 'realistic_motion', 'human_focused'],
    models: ['Kling 2.6', 'Kling 2.0']
  },
  {
    id: 'luma',
    name: 'Luma AI — Dream Machine (Ray 3)',
    category: 'affordable',
    tier: 'pro',
    link: 'https://lumalabs.ai/',
    strengths: ['Photorealistic image-to-video', 'Stunning visuals from static images'],
    useCase: 'Stunning visuals from static campaign images',
    costEstimate: 'Replicate / fal.ai hosting',
    apiType: 'hosted',
    description: 'Best for converting images to video',
    maxDuration: '60 seconds',
    outputFormat: '1080p',
    recommendedFor: ['image_to_video', 'campaign_assets', 'product_shots'],
    models: ['Dream Machine', 'Ray 3']
  },
  {
    id: 'ltx2',
    name: 'Lightricks — LTX-2 (Open-source)',
    category: 'affordable',
    tier: 'free',
    link: 'https://www.lightricks.com/ltx',
    strengths: ['Native synced audio + video', 'Fast image-to-video', '4K/50fps', 'Default for social shorts'],
    useCase: 'Default for social shorts — recommended starting point',
    costEstimate: '$0.04–0.16/sec',
    apiType: 'hosted',
    description: 'Replicate / fal.ai hosting with audio sync',
    maxDuration: '60 seconds',
    outputFormat: '4K, 50fps',
    recommendedFor: ['social_media', 'audio_sync', 'budget_friendly'],
    models: ['LTX-2']
  },
  {
    id: 'wan',
    name: 'Wan 2.6 / Wan 2.2 (Open-source)',
    category: 'affordable',
    tier: 'free',
    link: 'https://github.com/1div0/wanx',
    strengths: ['Good motion', 'MoE efficiency', 'Open-source'],
    useCase: 'Efficient video generation',
    costEstimate: 'Replicate / fal.ai hosting',
    apiType: 'hosted',
    description: 'Open-source model with MoE architecture',
    maxDuration: '60 seconds',
    outputFormat: '1080p',
    recommendedFor: ['open_source', 'efficient', 'cost_effective'],
    models: ['Wan 2.6', 'Wan 2.2']
  },
  {
    id: 'hunyuan',
    name: 'HunyuanVideo (Tencent open-source)',
    category: 'affordable',
    tier: 'free',
    link: 'https://github.com/Tencent/HunyuanVideo',
    strengths: ['Good motion', 'MoE efficiency', 'Emerging on platforms'],
    useCase: 'Enterprise video generation',
    costEstimate: 'Emerging on Replicate / Together.ai',
    apiType: 'hosted',
    description: 'Tencent open-source model',
    maxDuration: '60 seconds',
    outputFormat: '1080p',
    recommendedFor: ['enterprise', 'moe_architecture'],
    models: ['HunyuanVideo']
  },
  {
    id: 'mochi',
    name: 'Mochi (Genmo open-source)',
    category: 'affordable',
    tier: 'free',
    link: 'https://github.com/genmo-ai/Mochi',
    strengths: ['Cinematic quality', '13B+ params', 'Customizable'],
    useCase: 'Cinematic video generation',
    costEstimate: 'fal.ai / Fireworks hosting',
    apiType: 'hosted',
    description: 'Open-source model with cinematic capabilities',
    maxDuration: '90 seconds',
    outputFormat: '1080p',
    recommendedFor: ['cinematic', 'open_source', 'customizable'],
    models: ['Mochi']
  },
  {
    id: 'seedance',
    name: 'Seedance 1.5 Pro',
    category: 'affordable',
    tier: 'pro',
    link: 'https://www.seedance.com/',
    strengths: ['Customizable', 'Strong stylization', 'Product demos', 'Clean UGC style'],
    useCase: 'Product demos & UGC-style content',
    costEstimate: 'API available via platforms',
    apiType: 'hosted',
    description: 'Modal / Hugging Face Spaces',
    maxDuration: '60 seconds',
    outputFormat: '1080p',
    recommendedFor: ['product_demo', 'ugc_style', 'stylization'],
    models: ['Seedance 1.5 Pro']
  },
  {
    id: 'pika',
    name: 'Pika Labs — Pika 2.2',
    category: 'affordable',
    tier: 'pro',
    link: 'https://pika.art/',
    strengths: ['Quick iterations', 'Fun effects', 'Fast dreamy visuals'],
    useCase: 'Creative shorts with effects',
    costEstimate: 'Official API access',
    apiType: 'rest',
    description: 'Web-based with official API',
    maxDuration: '120 seconds',
    outputFormat: '1080p, 4K',
    recommendedFor: ['creative', 'effects', 'iteration'],
    models: ['Pika 2.2']
  },
  {
    id: 'hailuo',
    name: 'Hailuo 2.3 (MiniMax)',
    category: 'affordable',
    tier: 'pro',
    link: 'https://www.hailuo.ai/',
    strengths: ['Fast dreamy visuals', 'Budget-friendly'],
    useCase: 'Fast iteration & creative exploration',
    costEstimate: 'Third-party hosts',
    apiType: 'hosted',
    description: 'Available via third-party platforms',
    maxDuration: '60 seconds',
    outputFormat: '1080p',
    recommendedFor: ['fast_iteration', 'budget_friendly'],
    models: ['Hailuo 2.3']
  },
  {
    id: 'pixverse',
    name: 'Pixverse',
    category: 'affordable',
    tier: 'free',
    link: 'https://www.pixverse.ai/',
    strengths: ['Budget-friendly', 'Clean output', 'Easy integration'],
    useCase: 'Budget-friendly video generation',
    costEstimate: 'API supported',
    apiType: 'rest',
    description: 'Official API access available',
    maxDuration: '60 seconds',
    outputFormat: '1080p',
    recommendedFor: ['budget_friendly', 'easy_integration'],
    models: ['Pixverse']
  },
  {
    id: 'higgsfield',
    name: 'Higgsfield',
    category: 'affordable',
    tier: 'pro',
    link: 'https://www.higgsfield.ai/',
    strengths: ['Cinematic camera moves', 'Creative control'],
    useCase: 'Cinematic shots with camera movement',
    costEstimate: 'Emerging API',
    apiType: 'rest',
    description: 'Emerging API with cinematic focus',
    maxDuration: '60 seconds',
    outputFormat: '1080p',
    recommendedFor: ['cinematic', 'camera_movement'],
    models: ['Higgsfield']
  }
];

// Avatar / Talking-Head (Explainer & Spokesperson)
export const AVATAR_PROVIDERS: VideoProvider[] = [
  {
    id: 'heygen',
    name: 'HeyGen',
    category: 'avatar',
    tier: 'pro',
    link: 'https://www.heygen.com/api',
    strengths: ['Professional avatars', 'Multilingual support', 'Script-to-video'],
    useCase: 'Professional avatar videos & explainers',
    costEstimate: 'Full REST API',
    apiType: 'rest',
    description: 'Industry-leading avatar platform',
    maxDuration: '300 seconds',
    outputFormat: '1080p',
    recommendedFor: ['avatar', 'explainer', 'multilingual'],
    models: ['Avatar Studio', 'Stream']
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    category: 'avatar',
    tier: 'pro',
    link: 'https://www.synthesia.io/api',
    strengths: ['Professional avatars', 'Multilingual', 'Enterprise-ready'],
    useCase: 'Enterprise avatar video production',
    costEstimate: 'Robust developer API',
    apiType: 'rest',
    description: 'Enterprise avatars & video production',
    maxDuration: '300 seconds',
    outputFormat: '1080p, 4K',
    recommendedFor: ['enterprise', 'avatar', 'multilingual'],
    models: ['Synthesia Studio']
  },
  {
    id: 'deepbrain',
    name: 'DeepBrain AI',
    category: 'avatar',
    tier: 'pro',
    link: 'https://www.deepbrainai.io/api',
    strengths: ['Hyper-realistic avatars', 'Training-focused', 'Enterprise ready'],
    useCase: 'Hyper-realistic spokesperson videos',
    costEstimate: 'Available API',
    apiType: 'rest',
    description: 'Advanced avatar technology',
    maxDuration: '300 seconds',
    outputFormat: '1080p, 4K',
    recommendedFor: ['avatar', 'realistic', 'training'],
    models: ['DeepBrain AI']
  },
  {
    id: 'colossyan',
    name: 'Colossyan',
    category: 'avatar',
    tier: 'pro',
    link: 'https://www.colossyan.com/api',
    strengths: ['Hyper-realistic avatars', 'Training-focused avatars'],
    useCase: 'Training & educational videos with avatars',
    costEstimate: 'API supported',
    apiType: 'rest',
    description: 'Focus on training and education',
    maxDuration: '300 seconds',
    outputFormat: '1080p',
    recommendedFor: ['training', 'education', 'avatar'],
    models: ['Colossyan Creator']
  }
];

// Multi-Model Hosting Platforms
export const PLATFORM_PROVIDERS: VideoProvider[] = [
  {
    id: 'replicate',
    name: 'Replicate',
    category: 'platform',
    tier: 'free',
    link: 'https://replicate.com/api',
    strengths: ['Hosts LTX-2', 'Luma', 'Runway', 'Kling variants', 'Open models', 'Pay-per-use'],
    useCase: 'Multi-model access for all tiers',
    costEstimate: 'Pay-per-use',
    apiType: 'rest',
    description: 'Unified API for multiple video generation models',
    maxDuration: 'Model-dependent',
    outputFormat: 'Variable',
    recommendedFor: ['multi_model', 'pay_per_use', 'open_source'],
    models: ['LTX-2', 'Luma', 'Runway', 'Kling', 'open-source']
  },
  {
    id: 'fal',
    name: 'fal.ai',
    category: 'platform',
    tier: 'free',
    link: 'https://fal.ai/dashboard',
    strengths: ['Easy integration', 'LTX-2 hosting', 'Luma support', 'Runway variants', 'Kling models', 'Open-source options'],
    useCase: 'Easy integration with multiple models',
    costEstimate: 'Pay-per-use (~$0.04–0.16/sec)',
    apiType: 'rest',
    description: 'Multi-model hosting with simple API',
    maxDuration: 'Model-dependent',
    outputFormat: 'Variable',
    recommendedFor: ['multi_model', 'easy_integration', 'pay_per_use'],
    models: ['LTX-2', 'Luma', 'Runway', 'Kling', 'open-source']
  },
  {
    id: 'fireworks',
    name: 'Fireworks.ai / Together.ai',
    category: 'platform',
    tier: 'free',
    link: 'https://fireworks.ai/',
    strengths: ['Fast inference', 'LTX-2 proxy', 'Veo proxies', 'Open-source models', 'Great for speed'],
    useCase: 'Speed-optimized multi-model access',
    costEstimate: 'Fast inference for all models',
    apiType: 'rest',
    description: 'Performance-focused model hosting',
    maxDuration: 'Model-dependent',
    outputFormat: 'Variable',
    recommendedFor: ['multi_model', 'speed', 'performance'],
    models: ['LTX-2', 'Veo proxy', 'open-source']
  },
  {
    id: 'wavespeed',
    name: 'WaveSpeedAI / Runware',
    category: 'platform',
    tier: 'pro',
    link: 'https://wavespeed.io/',
    strengths: ['Kling aggregation', 'Seedance access', 'WAN models', 'Good for scaling', 'Aggregated access'],
    useCase: 'Load balancing & scaling',
    costEstimate: 'Scaling-optimized',
    apiType: 'rest',
    description: 'Aggregated access to multiple providers',
    maxDuration: 'Model-dependent',
    outputFormat: 'Variable',
    recommendedFor: ['scaling', 'load_balancing', 'aggregation'],
    models: ['Kling', 'Seedance', 'WAN', 'others']
  }
];

// All providers combined
export const ALL_VIDEO_PROVIDERS: VideoProvider[] = [
  ...PREMIUM_PROVIDERS,
  ...AFFORDABLE_PROVIDERS,
  ...AVATAR_PROVIDERS,
  ...PLATFORM_PROVIDERS
];

// Helper functions
export function getProviderById(id: string): VideoProvider | undefined {
  return ALL_VIDEO_PROVIDERS.find(p => p.id === id);
}

export function getProvidersByCategory(category: VideoProviderCategory): VideoProvider[] {
  return ALL_VIDEO_PROVIDERS.filter(p => p.category === category);
}

export function getProvidersByTier(tier: VideoTier): VideoProvider[] {
  return ALL_VIDEO_PROVIDERS.filter(p => p.tier === tier);
}

export function getRecommendedProviders(): VideoProvider[] {
  return ALL_VIDEO_PROVIDERS.filter(p => p.tier === 'free' || p.id === 'ltx2' || p.id === 'replicate' || p.id === 'fal');
}

export const INTEGRATION_ROADMAP = {
  phase1: {
    title: 'Phase 1: Foundation (Free/Pro)',
    description: 'Start with accessible, cost-effective options',
    providers: ['replicate', 'fal', 'ltx2'],
    tiers: ['free', 'pro']
  },
  phase2: {
    title: 'Phase 2: Premium (Hunter+)',
    description: 'Add premium cinema quality',
    providers: ['sora2', 'veo3'],
    tiers: ['hunter']
  },
  phase3: {
    title: 'Phase 3: Avatar (Pro+)',
    description: 'Add speaking character/avatar capabilities',
    providers: ['heygen', 'synthesia'],
    tiers: ['pro', 'hunter', 'agency']
  },
  phase4: {
    title: 'Phase 4: Scaling (All)',
    description: 'Use multi-host platforms for load balancing',
    providers: ['fireworks', 'wavespeed'],
    tiers: ['free', 'pro', 'hunter', 'agency']
  }
};
