/**
 * API Route: /api/generate-video
 * Backend handler for video generation with tier-based access and credit system
 */

import { generateVideo, canGenerateVideo, getVideoTierInfo } from '../services/videoService';
import { VideoGenerationRequest } from '../services/videoService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, prompt, engine = 'ltx2', userId, tier } = req.body as VideoGenerationRequest;

    // Validation
    if (!imageUrl || !prompt || !userId || !tier) {
      return res.status(400).json({ error: 'Missing required fields: imageUrl, prompt, userId, tier' });
    }

    // P0: Fair-use limits
    if (!(await canGenerateVideo(userId, tier))) {
      const tierInfo = getVideoTierInfo(tier);
      return res.status(429).json({
        error: 'Monthly video limit reached',
        monthlyLimit: tierInfo.monthlyLimit,
        message: `${tier} tier limited to ${tierInfo.monthlyLimit} videos/month`,
      });
    }

    // Generate video with appropriate engine
    const result = await generateVideo({
      imageUrl,
      prompt,
      engine,
      userId,
      tier,
    });

    return res.status(200).json({
      success: true,
      ...result,
      disclosure: {
        engine:
          engine === 'ltx2'
            ? 'LTX-2 (open-source)'
            : engine === 'sora2'
              ? 'Sora 2 Pro (OpenAI)'
              : 'Veo 3 (Google)',
        ownership: 'You own this content',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Video generation error:', message);

    return res.status(400).json({
      error: message,
      hint: message.includes('tier')
        ? 'Upgrade your tier to access premium engines'
        : 'Check your image and prompt, then try again',
    });
  }
}
