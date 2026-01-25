/**
 * SOCIAL POSTING SERVICE
 * Auto-post campaigns to Meta, Twitter, LinkedIn, TikTok
 * Supports direct API and Buffer/Later fallback
 */

interface SocialCredentials {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  accessToken: string;
  accountId?: string;
  pageId?: string;
}

interface PostPayload {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
  hashtags?: string[];
  mentions?: string[];
  scheduledTime?: Date;
}

interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  platform: string;
}

class SocialPostingService {
  private credentials: Map<string, SocialCredentials> = new Map();

  /**
   * Initialize credentials from settings
   */
  initialize(settings: any) {
    try {
      const social = settings?.social || {};
      
      Object.entries(social).forEach(([platform, config]: [string, any]) => {
        if (config?.accessToken) {
          this.credentials.set(platform, {
            platform: platform as any,
            accessToken: config.accessToken,
            accountId: config.accountId,
            pageId: config.pageId,
          });
          console.log(`[SocialPostingService] ✓ Initialized ${platform}`);
        }
      });
    } catch (e) {
      console.error('[SocialPostingService] Initialization failed:', e);
    }
  }

  /**
   * Post to single platform
   */
  async postTo(platform: string, payload: PostPayload): Promise<PostResult> {
    const creds = this.credentials.get(platform);
    
    if (!creds) {
      return {
        success: false,
        error: `${platform} not configured. Add token in Settings → Social Media`,
        platform
      };
    }

    try {
      switch (platform) {
        case 'instagram':
          return await this.postToInstagram(creds, payload);
        case 'facebook':
          return await this.postToFacebook(creds, payload);
        case 'twitter':
          return await this.postToTwitter(creds, payload);
        case 'linkedin':
          return await this.postToLinkedIn(creds, payload);
        case 'tiktok':
          return await this.postToTikTok(creds, payload);
        default:
          return { success: false, error: 'Unknown platform', platform };
      }
    } catch (e: any) {
      console.error(`[SocialPostingService] Post failed (${platform}):`, e);
      return {
        success: false,
        error: e.message || 'Failed to post',
        platform
      };
    }
  }

  /**
   * Post to multiple platforms
   */
  async postToAll(payload: PostPayload): Promise<PostResult[]> {
    return Promise.all(
      Array.from(this.credentials.keys()).map(platform => this.postTo(platform, payload))
    );
  }

  /**
   * Post to Instagram (via Meta Graph API)
   */
  private async postToInstagram(creds: SocialCredentials, payload: PostPayload): Promise<PostResult> {
    if (!creds.accountId) {
      return { success: false, error: 'Instagram account ID not configured', platform: 'instagram' };
    }

    const caption = [
      payload.text,
      ...(payload.hashtags || []),
      ...(payload.mentions?.map(m => `@${m}`) || [])
    ].join('\n');

    try {
      // First upload image/video
      const mediaResponse = await fetch(
        `https://graph.instagram.com/v18.0/${creds.accountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: payload.imageUrl,
            caption,
            access_token: creds.accessToken,
          })
        }
      );

      if (!mediaResponse.ok) {
        throw new Error(`Instagram API error: ${mediaResponse.status}`);
      }

      const media = await mediaResponse.json() as any;

      // Then publish
      const publishResponse = await fetch(
        `https://graph.instagram.com/v18.0/${creds.accountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: media.id,
            access_token: creds.accessToken,
          })
        }
      );

      if (!publishResponse.ok) {
        throw new Error(`Instagram publish error: ${publishResponse.status}`);
      }

      const result = await publishResponse.json() as any;
      return {
        success: true,
        postId: result.id,
        url: `https://instagram.com/p/${result.id}`,
        platform: 'instagram'
      };
    } catch (e: any) {
      throw e;
    }
  }

  /**
   * Post to Facebook
   */
  private async postToFacebook(creds: SocialCredentials, payload: PostPayload): Promise<PostResult> {
    if (!creds.pageId) {
      return { success: false, error: 'Facebook page ID not configured', platform: 'facebook' };
    }

    const message = [
      payload.text,
      payload.link ? `\n${payload.link}` : '',
      ...(payload.hashtags || []).map(h => `#${h}`),
    ].join(' ');

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${creds.pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          picture: payload.imageUrl,
          link: payload.link,
          access_token: creds.accessToken,
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    const result = await response.json() as any;
    return {
      success: true,
      postId: result.id,
      url: `https://facebook.com/${result.id}`,
      platform: 'facebook'
    };
  }

  /**
   * Post to Twitter/X
   */
  private async postToTwitter(creds: SocialCredentials, payload: PostPayload): Promise<PostResult> {
    const text = [
      payload.text,
      payload.link ? `\n${payload.link}` : '',
      ...(payload.hashtags || []).map(h => `#${h}`),
      ...(payload.mentions?.map(m => `@${m}`) || [])
    ].join(' ');

    // Check length (Twitter v2 has 280 char limit)
    if (text.length > 280) {
      console.warn('[SocialPostingService] Twitter text exceeds 280 chars, truncating');
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.substring(0, 280),
        media: payload.imageUrl ? { media_ids: [payload.imageUrl] } : undefined,
      })
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const result = await response.json() as any;
    return {
      success: true,
      postId: result.data?.id,
      url: `https://twitter.com/i/web/status/${result.data?.id}`,
      platform: 'twitter'
    };
  }

  /**
   * Post to LinkedIn
   */
  private async postToLinkedIn(creds: SocialCredentials, payload: PostPayload): Promise<PostResult> {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${creds.accountId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: payload.text,
            },
            shareMediaCategory: payload.imageUrl ? 'IMAGE' : 'NONE',
            media: payload.imageUrl ? [
              {
                status: 'READY',
                media: payload.imageUrl,
              }
            ] : [],
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const result = await response.json() as any;
    return {
      success: true,
      postId: result.id,
      platform: 'linkedin'
    };
  }

  /**
   * Post to TikTok
   * Note: TikTok API is limited; recommend using official TikTok Creator Marketplace
   */
  private async postToTikTok(creds: SocialCredentials, payload: PostPayload): Promise<PostResult> {
    // TikTok API is very limited without official partnership
    // Recommend: Use buffer.com or later.com for TikTok scheduling
    return {
      success: false,
      error: 'TikTok direct API not available. Use Buffer or Later for scheduling.',
      platform: 'tiktok'
    };
  }

  /**
   * Schedule post for later (requires Buffer/Later integration)
   */
  async schedulePost(platforms: string[], payload: PostPayload, scheduleTime: Date): Promise<PostResult[]> {
    // Update payload with schedule time
    const scheduledPayload = { ...payload, scheduledTime: scheduleTime };
    return Promise.all(platforms.map(p => this.postTo(p, scheduledPayload)));
  }

  /**
   * Check if platform is configured
   */
  isConfigured(platform: string): boolean {
    return this.credentials.has(platform);
  }

  /**
   * Get configured platforms
   */
  getConfiguredPlatforms(): string[] {
    return Array.from(this.credentials.keys());
  }

  /**
   * Format post for specific platform
   */
  formatPost(platform: string, payload: PostPayload): string {
    const hashtags = (payload.hashtags || []).join(' ');
    const mentions = (payload.mentions || []).map(m => `@${m}`).join(' ');

    switch (platform) {
      case 'twitter':
        // 280 char limit
        return `${payload.text} ${hashtags}`.substring(0, 280);
      case 'linkedin':
        // Longer format
        return `${payload.text}\n\n${hashtags}`;
      case 'instagram':
        // Caption format
        return `${payload.text}\n\n${hashtags}\n${mentions}`;
      default:
        return `${payload.text} ${hashtags}`;
    }
  }
}

export const socialPostingService = new SocialPostingService();

/**
 * Helper: Auto-initialize from settings
 */
export const initializeSocialPostingService = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
    socialPostingService.initialize(settings);
  } catch (e) {
    console.error('[socialPostingService] Failed to initialize from settings:', e);
  }
};
