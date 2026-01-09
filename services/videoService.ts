/**
 * Video Generation Service
 * Handles multi-engine video generation with tier-based access and credit deduction
 */

import { CampaignAsset, UserProfile } from '../types';

export type VideoEngine = 'ltx2' | 'sora2' | 'veo3';

export interface VideoGenerationRequest {
  imageUrl: string;
  prompt: string;
  engine?: VideoEngine;
  userId: string;
  tier: UserProfile['tier'];
}

export interface VideoGenerationResponse {
  videoUrl: string;
  engineUsed: VideoEngine;
  costCredits: number;
  generatedAt: string;
}

// Mock API calls (replace with real endpoints)
async function callLTX2API(imageUrl: string, prompt: string): Promise<string> {
  // LTX-2 via Replicate or fal.ai
  console.log('🎬 Calling LTX-2 API with prompt:', prompt);
  
  // Mock response - replace with actual API call
  return `https://example.com/videos/ltx2_${Date.now()}.mp4`;
}

async function callSora2API(imageUrl: string, prompt: string): Promise<string> {
  // Sora 2 Pro via OpenAI
  console.log('🎬 Calling Sora 2 Pro API with prompt:', prompt);
  
  // Mock response - replace with actual API call
  return `https://example.com/videos/sora2_${Date.now()}.mp4`;
}

async function callVeo3API(imageUrl: string, prompt: string): Promise<string> {
  // Veo 3 via Google
  console.log('🎬 Calling Veo 3 API with prompt:', prompt);
  
  // Mock response - replace with actual API call
  return `https://example.com/videos/veo3_${Date.now()}.mp4`;
}

// Check if user can generate video (monthly limits)
export async function canGenerateVideo(userId: string, tier: UserProfile['tier']): Promise<boolean> {
  const videoLog = localStorage.getItem(`video_log_${userId}`);
  let videoCount = 0;

  if (videoLog) {
    try {
      const logs = JSON.parse(videoLog) as Array<{ timestamp: number }>;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      videoCount = logs.filter(log => log.timestamp >= thisMonth.getTime()).length;
    } catch (e) {
      console.error('Failed to parse video log', e);
    }
  }

  const limits: Record<UserProfile['tier'], number> = {
    free: 5,
    pro: 50,
    hunter: Infinity,
    agency: Infinity,
  };

  return videoCount < limits[tier];
}

// Get remaining videos for tier this month
export async function getRemainingVideos(userId: string, tier: UserProfile['tier']): Promise<number> {
  const videoLog = localStorage.getItem(`video_log_${userId}`);
  let videoCount = 0;

  if (videoLog) {
    try {
      const logs = JSON.parse(videoLog) as Array<{ timestamp: number }>;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      videoCount = logs.filter(log => log.timestamp >= thisMonth.getTime()).length;
    } catch (e) {
      console.error('Failed to parse video log', e);
    }
  }

  const limits: Record<UserProfile['tier'], number> = {
    free: 5,
    pro: 50,
    hunter: Infinity,
    agency: Infinity,
  };

  const limit = limits[tier];
  return limit === Infinity ? Infinity : limit - videoCount;
}

// Deduct credits from user
async function deductCredits(userId: string, amount: number): Promise<void> {
  const userCredits = localStorage.getItem(`credits_${userId}`);
  const current = userCredits ? parseInt(userCredits, 10) : 0;
  localStorage.setItem(`credits_${userId}`, String(Math.max(0, current - amount)));
}

// Get user credits
export async function getUserCredits(userId: string): Promise<number> {
  const userCredits = localStorage.getItem(`credits_${userId}`);
  return userCredits ? parseInt(userCredits, 10) : 0;
}

// Log video generation
async function logVideoGeneration(data: {
  userId: string;
  engine: VideoEngine;
  credits: number;
}): Promise<void> {
  const videoLog = localStorage.getItem(`video_log_${data.userId}`);
  const logs = videoLog ? JSON.parse(videoLog) : [];
  logs.push({
    timestamp: Date.now(),
    engine: data.engine,
    credits: data.credits,
  });
  localStorage.setItem(`video_log_${data.userId}`, JSON.stringify(logs));
}

/**
 * Main video generation handler
 * Routes to appropriate engine based on tier and user selection
 */
export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  const { imageUrl, prompt, engine = 'ltx2', userId, tier } = request;

  // P0: Fair-use limits
  if (!(await canGenerateVideo(userId, tier))) {
    throw new Error(`Monthly video limit reached for ${tier} tier`);
  }

  let videoUrl: string;
  let costCredits: number;

  switch (engine) {
    case 'sora2':
      // Restrict to Hunter/Agency tiers
      if (!['hunter', 'agency'].includes(tier)) {
        throw new Error('Sora 2 Pro available for Hunter tier and above');
      }
      videoUrl = await callSora2API(imageUrl, prompt);
      costCredits = tier === 'hunter' ? 5 : 0; // Agency has unlimited
      break;

    case 'veo3':
      // Restrict to Hunter/Agency tiers
      if (!['hunter', 'agency'].includes(tier)) {
        throw new Error('Veo 3 available for Hunter tier and above');
      }
      videoUrl = await callVeo3API(imageUrl, prompt);
      costCredits = tier === 'hunter' ? 5 : 0; // Agency has unlimited
      break;

    default: // ltx2
      videoUrl = await callLTX2API(imageUrl, prompt);
      costCredits = tier === 'hunter' || tier === 'agency' ? 1 : 0;
      break;
  }

  // Deduct credits if applicable
  if (costCredits > 0) {
    await deductCredits(userId, costCredits);
  }

  // Log generation with engine disclosure
  await logVideoGeneration({ userId, engine, credits: costCredits });

  return {
    videoUrl,
    engineUsed: engine,
    costCredits,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get tier-specific video generation limits and pricing
 */
export function getVideoTierInfo(tier: UserProfile['tier']) {
  const tiers = {
    free: {
      monthlyLimit: 5,
      engines: ['ltx2'],
      costPerVideo: { ltx2: 0 },
      note: 'Social-optimized shorts (15 seconds, vertical)',
    },
    pro: {
      monthlyLimit: 50,
      engines: ['ltx2'],
      costPerVideo: { ltx2: 0 },
      note: 'LTX-2 optimized for content creators',
    },
    hunter: {
      monthlyLimit: Infinity,
      engines: ['ltx2', 'sora2', 'veo3'],
      costPerVideo: { ltx2: 1, sora2: 5, veo3: 5 },
      note: 'Premium engines with credit system',
      creditPacks: [
        { credits: 100, price: 19 },
        { credits: 500, price: 79 },
        { credits: 1000, price: 139 },
      ],
    },
    agency: {
      monthlyLimit: Infinity,
      engines: ['ltx2', 'sora2', 'veo3'],
      costPerVideo: { ltx2: 0, sora2: 0, veo3: 0 },
      note: 'Unlimited access to all engines',
    },
  };

  return tiers[tier];
}
