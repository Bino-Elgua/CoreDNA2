# 🔌 Video Provider Adapter Implementation Guide

**Status:** Implementation Blueprint  
**Date:** January 2026  
**Scope:** Building adapters for 8 core providers  

---

## Overview

Create provider-agnostic adapters that:
- Abstract API differences
- Handle authentication
- Manage rate limiting
- Implement retry logic
- Track costs

---

## Architecture

```
videoService.ts
    ↓
providerFactory.ts ← Routes by tier/preference
    ↓
adapters/
├── ltx2.ts       (fal.ai)
├── luma.ts       (fal.ai)
├── sora2.ts      (OpenAI)
├── veo3.ts       (Vertex AI)
├── runway.ts     (Runway)
├── kling.ts      (Runway)
├── heygen.ts     (HeyGen)
└── synthesia.ts  (Synthesia)
```

---

## Base Adapter Interface

**File:** `src/services/adapters/baseAdapter.ts`

```typescript
export interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string; // For image-to-video
  duration?: number;
  style?: string;
  width?: number;
  height?: number;
  fps?: number;
}

export interface VideoGenerationResponse {
  videoUrl: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  createdAt: string;
  estimatedCost: number;
}

export interface AdapterConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export abstract class BaseVideoAdapter {
  protected apiKey: string;
  protected baseUrl: string;
  protected timeout: number;
  protected maxRetries: number;

  constructor(config: AdapterConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || '';
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
  }

  abstract generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
  abstract getStatus(jobId: string): Promise<{ status: string; progress?: number }>;
  abstract estimateCost(request: VideoGenerationRequest): number;

  protected async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxAttempts - 1) {
          const delay = Math.pow(2, i) * 1000; // exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  protected async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      ),
    ]);
  }
}
```

---

## Provider Adapters

### 1. LTX-2 Adapter

**File:** `src/services/adapters/ltx2.ts`

```typescript
import { BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse, AdapterConfig } from './baseAdapter';

export class LTX2Adapter extends BaseVideoAdapter {
  constructor(apiKey: string, provider: 'fal' | 'replicate' = 'fal') {
    super({
      apiKey,
      baseUrl: provider === 'fal' 
        ? 'https://api.fal.ai/v1'
        : 'https://api.replicate.com/v1',
      timeout: 60000,
      maxRetries: 3,
    });
    this.provider = provider;
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    return this.retry(async () => {
      if (request.imageUrl) {
        return this.imageToVideo(request);
      }
      return this.textToVideo(request);
    });
  }

  private async textToVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const endpoint = this.provider === 'fal'
      ? `${this.baseUrl}/ltx_text_to_video`
      : `${this.baseUrl}/predictions`;

    const body = this.provider === 'fal'
      ? {
          prompt: request.prompt,
          duration: request.duration || 8,
          width: request.width || 1024,
          height: request.height || 576,
          fps: request.fps || 24,
        }
      : {
          version: 'ltx-model-hash',
          input: {
            prompt: request.prompt,
            duration: request.duration || 8,
          },
        };

    const response = await this.withTimeout(
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }),
      this.timeout
    );

    if (!response.ok) {
      throw new Error(`LTX-2 API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Poll for completion if needed
    if (this.provider === 'fal' && data.request_id) {
      return this.pollCompletion(data.request_id);
    }

    return {
      videoUrl: data.video.url || data.output[0].url,
      duration: request.duration || 8,
      width: request.width || 1024,
      height: request.height || 576,
      fps: request.fps || 24,
      createdAt: new Date().toISOString(),
      estimatedCost: this.estimateCost(request),
    };
  }

  private async imageToVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const endpoint = `${this.baseUrl}/ltx_image_to_video`;

    const response = await this.withTimeout(
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: request.imageUrl,
          prompt: request.prompt || 'Convert image to video',
          duration: request.duration || 8,
          fps: request.fps || 24,
        }),
      }),
      this.timeout
    );

    if (!response.ok) {
      throw new Error(`LTX-2 image-to-video error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.request_id) {
      return this.pollCompletion(data.request_id);
    }

    return {
      videoUrl: data.video.url,
      duration: request.duration || 8,
      width: 1024,
      height: 576,
      fps: request.fps || 24,
      createdAt: new Date().toISOString(),
      estimatedCost: this.estimateCost(request),
    };
  }

  private async pollCompletion(requestId: string): Promise<VideoGenerationResponse> {
    const endpoint = `${this.baseUrl}/requests/${requestId}`;
    
    let attempts = 0;
    while (attempts < 60) {
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Key ${this.apiKey}` },
      });

      const data = await response.json();

      if (data.status === 'completed') {
        return {
          videoUrl: data.output.video.url,
          duration: data.output.duration || 8,
          width: data.output.width || 1024,
          height: data.output.height || 576,
          fps: data.output.fps || 24,
          createdAt: new Date().toISOString(),
          estimatedCost: 0.06, // Avg cost
        };
      }

      if (data.status === 'failed') {
        throw new Error(`LTX-2 generation failed: ${data.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('LTX-2 generation timeout');
  }

  async getStatus(jobId: string): Promise<{ status: string; progress?: number }> {
    const response = await fetch(
      `${this.baseUrl}/requests/${jobId}`,
      { headers: { 'Authorization': `Key ${this.apiKey}` } }
    );

    const data = await response.json();
    return {
      status: data.status,
      progress: data.progress_percentage,
    };
  }

  estimateCost(request: VideoGenerationRequest): number {
    const duration = request.duration || 8;
    return duration * 0.0075; // ~$0.06 per 8 seconds
  }

  private provider: 'fal' | 'replicate';
}
```

---

### 2. Sora 2 Adapter

**File:** `src/services/adapters/sora2.ts`

```typescript
import { BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse } from './baseAdapter';

export class Sora2Adapter extends BaseVideoAdapter {
  constructor(apiKey: string) {
    super({
      apiKey,
      baseUrl: 'https://api.openai.com/v1',
      timeout: 90000,
      maxRetries: 2,
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    return this.retry(async () => {
      const response = await this.withTimeout(
        fetch(`${this.baseUrl}/videos/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sora-2',
            prompt: request.prompt,
            duration: Math.min(request.duration || 20, 60),
            quality: 'hd',
            size: '1920x1080', // or '1280x720' for mobile
          }),
        }),
        this.timeout
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Sora 2 API error: ${error.error?.message}`);
      }

      const data = await response.json();

      return {
        videoUrl: data.data[0].url,
        duration: request.duration || 20,
        width: 1920,
        height: 1080,
        fps: 24,
        createdAt: new Date().toISOString(),
        estimatedCost: this.estimateCost(request),
      };
    });
  }

  async getStatus(jobId: string): Promise<{ status: string; progress?: number }> {
    // Sora 2 doesn't support polling yet, returns 'completed' or 'failed'
    return { status: 'completed' };
  }

  estimateCost(request: VideoGenerationRequest): number {
    const duration = request.duration || 20;
    return duration * 0.015; // ~$0.25 per 20 seconds
  }
}
```

---

### 3. Veo 3 Adapter

**File:** `src/services/adapters/veo3.ts`

```typescript
import { BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse } from './baseAdapter';

export class Veo3Adapter extends BaseVideoAdapter {
  private projectId: string;

  constructor(apiKey: string, projectId: string) {
    super({
      apiKey,
      baseUrl: `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-3:predict`,
      timeout: 90000,
      maxRetries: 2,
    });
    this.projectId = projectId;
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    return this.retry(async () => {
      const response = await this.withTimeout(
        fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: request.prompt,
                duration_seconds: Math.min(request.duration || 20, 60),
              },
            ],
          }),
        }),
        this.timeout
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Veo 3 API error: ${error.error?.message}`);
      }

      const data = await response.json();
      const videoUrl = data.predictions[0].video_uri;

      return {
        videoUrl,
        duration: request.duration || 20,
        width: 1920,
        height: 1080,
        fps: 24,
        createdAt: new Date().toISOString(),
        estimatedCost: this.estimateCost(request),
      };
    });
  }

  async getStatus(jobId: string): Promise<{ status: string; progress?: number }> {
    // Veo 3 uses long-running operations
    const response = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/${jobId}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    const data = await response.json();
    return {
      status: data.done ? 'completed' : 'processing',
      progress: data.metadata?.progress_percentage,
    };
  }

  estimateCost(request: VideoGenerationRequest): number {
    const duration = request.duration || 20;
    return duration * 0.015; // ~$0.30 per 20 seconds
  }
}
```

---

### 4. Runway Adapter

**File:** `src/services/adapters/runway.ts`

```typescript
import { BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse } from './baseAdapter';

export class RunwayAdapter extends BaseVideoAdapter {
  constructor(apiKey: string) {
    super({
      apiKey,
      baseUrl: 'https://api.runwayml.com/v1',
      timeout: 120000,
      maxRetries: 2,
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    return this.retry(async () => {
      const endpoint = request.imageUrl 
        ? `${this.baseUrl}/image_to_video`
        : `${this.baseUrl}/text_to_video`;

      const payload = request.imageUrl
        ? {
            image_url: request.imageUrl,
            prompt: request.prompt || 'Generate video',
            duration: Math.min(request.duration || 20, 60),
          }
        : {
            prompt: request.prompt,
            duration: Math.min(request.duration || 20, 60),
          };

      const response = await this.withTimeout(
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }),
        this.timeout
      );

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Poll for completion
      return this.pollCompletion(data.id);
    });
  }

  private async pollCompletion(taskId: string): Promise<VideoGenerationResponse> {
    let attempts = 0;
    while (attempts < 120) {
      const response = await fetch(
        `${this.baseUrl}/tasks/${taskId}`,
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      );

      const data = await response.json();

      if (data.status === 'SUCCEEDED') {
        return {
          videoUrl: data.output[0],
          duration: 20,
          width: 1920,
          height: 1080,
          fps: 24,
          createdAt: new Date().toISOString(),
          estimatedCost: this.estimateCost({ prompt: '', duration: 20 }),
        };
      }

      if (data.status === 'FAILED') {
        throw new Error(`Runway generation failed: ${data.failure_reason}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Runway generation timeout');
  }

  async getStatus(jobId: string): Promise<{ status: string; progress?: number }> {
    const response = await fetch(
      `${this.baseUrl}/tasks/${jobId}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    const data = await response.json();
    return {
      status: data.status.toLowerCase(),
      progress: data.progress,
    };
  }

  estimateCost(request: VideoGenerationRequest): number {
    // Runway uses credits, estimate based on duration
    const duration = request.duration || 20;
    return Math.ceil((duration / 20) * 15); // ~15 credits per 20 seconds
  }
}
```

---

### 5. Luma Adapter

**File:** `src/services/adapters/luma.ts`

```typescript
import { BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse } from './baseAdapter';

export class LumaAdapter extends BaseVideoAdapter {
  constructor(apiKey: string) {
    super({
      apiKey,
      baseUrl: 'https://api.fal.ai/v1',
      timeout: 60000,
      maxRetries: 3,
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!request.imageUrl) {
      throw new Error('Luma Dream Machine requires an image URL');
    }

    return this.retry(async () => {
      const response = await this.withTimeout(
        fetch(`${this.baseUrl}/luma_dream_machine`, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: request.imageUrl,
            prompt: request.prompt || 'Generate video',
            duration: Math.min(request.duration || 5, 10),
          }),
        }),
        this.timeout
      );

      if (!response.ok) {
        throw new Error(`Luma API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.request_id) {
        return this.pollCompletion(data.request_id);
      }

      return {
        videoUrl: data.video.url,
        duration: Math.min(request.duration || 5, 10),
        width: 1024,
        height: 576,
        fps: 24,
        createdAt: new Date().toISOString(),
        estimatedCost: this.estimateCost(request),
      };
    });
  }

  private async pollCompletion(requestId: string): Promise<VideoGenerationResponse> {
    let attempts = 0;
    while (attempts < 60) {
      const response = await fetch(
        `${this.baseUrl}/requests/${requestId}`,
        { headers: { 'Authorization': `Key ${this.apiKey}` } }
      );

      const data = await response.json();

      if (data.status === 'completed') {
        return {
          videoUrl: data.output.video.url,
          duration: data.output.duration || 5,
          width: 1024,
          height: 576,
          fps: 24,
          createdAt: new Date().toISOString(),
          estimatedCost: this.estimateCost({ prompt: '', imageUrl: '', duration: 5 }),
        };
      }

      if (data.status === 'failed') {
        throw new Error(`Luma generation failed: ${data.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Luma generation timeout');
  }

  async getStatus(jobId: string): Promise<{ status: string; progress?: number }> {
    const response = await fetch(
      `${this.baseUrl}/requests/${jobId}`,
      { headers: { 'Authorization': `Key ${this.apiKey}` } }
    );

    const data = await response.json();
    return {
      status: data.status,
      progress: data.progress_percentage,
    };
  }

  estimateCost(request: VideoGenerationRequest): number {
    const duration = request.duration || 5;
    return duration * 0.03; // ~$0.15 per 5 seconds
  }
}
```

---

## Provider Factory

**File:** `src/services/adapters/providerFactory.ts`

```typescript
import { VideoTier, VideoEngine } from '../constants/videoProviders';
import { BaseVideoAdapter } from './baseAdapter';
import { LTX2Adapter } from './ltx2';
import { Sora2Adapter } from './sora2';
import { Veo3Adapter } from './veo3';
import { RunwayAdapter } from './runway';
import { LumaAdapter } from './luma';

export class ProviderFactory {
  private static adapters: Map<string, BaseVideoAdapter> = new Map();

  static createAdapter(
    engine: VideoEngine,
    tier: VideoTier
  ): BaseVideoAdapter {
    const cacheKey = `${engine}-${tier}`;

    if (this.adapters.has(cacheKey)) {
      return this.adapters.get(cacheKey)!;
    }

    let adapter: BaseVideoAdapter;

    switch (engine) {
      case 'ltx2':
        adapter = new LTX2Adapter(process.env.REACT_APP_FAL_API_KEY!);
        break;

      case 'luma':
        adapter = new LumaAdapter(process.env.REACT_APP_FAL_API_KEY!);
        break;

      case 'sora2':
        if (tier !== 'hunter' && tier !== 'agency') {
          throw new Error('Sora 2 available for Hunter tier and above');
        }
        adapter = new Sora2Adapter(process.env.REACT_APP_OPENAI_API_KEY!);
        break;

      case 'veo3':
        if (tier !== 'hunter' && tier !== 'agency') {
          throw new Error('Veo 3 available for Hunter tier and above');
        }
        adapter = new Veo3Adapter(
          process.env.REACT_APP_GOOGLE_API_KEY!,
          process.env.REACT_APP_GOOGLE_PROJECT_ID!
        );
        break;

      case 'runway':
      case 'kling':
        if (tier !== 'hunter' && tier !== 'agency') {
          throw new Error('Runway available for Hunter tier and above');
        }
        adapter = new RunwayAdapter(process.env.REACT_APP_RUNWAY_API_KEY!);
        break;

      default:
        throw new Error(`Unsupported provider: ${engine}`);
    }

    this.adapters.set(cacheKey, adapter);
    return adapter;
  }

  static clearCache(): void {
    this.adapters.clear();
  }
}
```

---

## Integration Checklist

### Phase 1: Base Infrastructure
- [ ] Create `baseAdapter.ts`
- [ ] Create `providerFactory.ts`
- [ ] Add TypeScript interfaces

### Phase 2: Core Adapters
- [ ] Implement LTX2Adapter
- [ ] Implement LumaAdapter
- [ ] Implement Sora2Adapter
- [ ] Implement Veo3Adapter
- [ ] Implement RunwayAdapter

### Phase 3: Testing
- [ ] Unit tests for each adapter
- [ ] Integration tests with real APIs
- [ ] Error handling tests
- [ ] Timeout tests
- [ ] Rate limiting tests

### Phase 4: Production
- [ ] Add API key validation
- [ ] Add cost tracking
- [ ] Add analytics logging
- [ ] Add alert system for failures

---

**Status:** Blueprint Complete  
**Ready for Development:** Yes  
**Estimated LOC:** ~2,500 lines

