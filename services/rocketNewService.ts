/**
 * Rocket.new Service
 * Deploys generated sites to Rocket.new for real live URLs
 * One-click deployment with Sonic Agent integration
 */

import { BrandDNA, GlobalSettings } from '../types';
import { GeneratedSite } from './siteGeneratorService';

export interface RocketNewPayload {
    prompt: string;
    framework: 'nextjs-tailwind';
    data: {
        brandDNA: BrandDNA;
        sonicAgent: {
            enabled: boolean;
            voiceEnabled: boolean;
            ttsProvider?: string;
            voiceType?: string;
            tone: string;
            primaryColor: string;
            secondaryColor: string;
        };
        pageStructure: {
            pages: ('home' | 'about' | 'services' | 'portfolio' | 'contact' | 'blog')[];
            includeNavigation: boolean;
            includeBlog: boolean;
        };
    };
}

export interface RocketNewDeploymentResult {
    success: boolean;
    siteUrl: string;
    chatUrl: string;
    deployedAt: number;
    buildTime: number;
    error?: string;
}

class RocketNewService {
    private apiUrl = 'https://api.rocket.new/v1/build';

    /**
     * Deploy site to Rocket.new
     */
    async deploySite(
        dna: BrandDNA,
        apiKey: string,
        sonicConfig: any,
        onProgress?: (message: string, progress: number) => void
    ): Promise<RocketNewDeploymentResult> {
        const startTime = Date.now();

        try {
            if (!apiKey) {
                throw new Error('Rocket.new API key not configured. Add it in Settings → Website Options.');
            }

            onProgress?.('Building deployment payload...', 10);

            // Build the Rocket.new payload
            const payload = this.buildPayload(dna, sonicConfig);

            onProgress?.('Sending to Rocket.new...', 20);

            // POST to Rocket.new API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(error.message || `Rocket.new API error: ${response.status}`);
            }

            onProgress?.('Building your site...', 40);

            const result = await response.json();

            onProgress?.('Embedding Sonic Agent...', 70);

            // Ensure we have the site URL
            const siteUrl = result.url || result.siteUrl || `https://${dna.name.toLowerCase().replace(/\s/g, '-')}.rocket.new`;
            const chatUrl = `${siteUrl}#chat`;

            onProgress?.('Finalizing deployment...', 90);

            const buildTime = Date.now() - startTime;

            return {
                success: true,
                siteUrl,
                chatUrl,
                deployedAt: Date.now(),
                buildTime,
            };
        } catch (error: any) {
            console.error('Rocket.new deployment failed:', error);
            return {
                success: false,
                siteUrl: '',
                chatUrl: '',
                deployedAt: 0,
                buildTime: Date.now() - startTime,
                error: error.message || 'Deployment failed',
            };
        }
    }

    /**
     * Build Rocket.new deployment payload
     */
    private buildPayload(dna: BrandDNA, sonicConfig: any): RocketNewPayload {
        const prompt = this.generateDeploymentPrompt(dna, sonicConfig);

        return {
            prompt,
            framework: 'nextjs-tailwind',
            data: {
                brandDNA: dna,
                sonicAgent: {
                    enabled: sonicConfig.enabled,
                    voiceEnabled: sonicConfig.voiceEnabled,
                    ttsProvider: sonicConfig.ttsProvider,
                    voiceType: sonicConfig.voiceType,
                    tone: dna.toneOfVoice?.description || 'Professional',
                    primaryColor: dna.colors[0]?.hex || '#000',
                    secondaryColor: dna.colors[1]?.hex || '#333',
                },
                pageStructure: {
                    pages: ['home', 'about', 'services', 'portfolio', 'contact'],
                    includeNavigation: true,
                    includeBlog: false,
                },
            },
        };
    }

    /**
     * Generate the deployment prompt for Rocket.new
     */
    private generateDeploymentPrompt(dna: BrandDNA, sonicConfig: any): string {
        const blogNote = sonicConfig.includeBlog ? '\n- Add a blog page with latest posts' : '';

        return `Generate a professional Next.js website for "${dna.name}" using Tailwind CSS with the following specifications:

BRAND IDENTITY:
- Mission: ${dna.mission}
- Tagline: ${dna.tagline}
- Description: ${dna.description}
- Target Audience: ${dna.targetAudience}
- Tone: ${dna.toneOfVoice?.description || 'Professional'}

VISUAL DESIGN:
- Primary Color: ${dna.colors[0]?.hex || '#000'}
- Secondary Color: ${dna.colors[1]?.hex || '#333'}
- Font Family: ${dna.fonts[0]?.family || 'Inter'}
- Visual Style: ${dna.visualStyle?.description || 'Modern and professional'}

PAGE STRUCTURE:
1. Home Page - Hero section with mission statement, features highlighting top 3 strengths, and CTA
2. About Page - Brand story narrative, core values, team introduction
3. Services Page - Feature 5-6 services based on strengths and expertise
4. Portfolio Page - Showcase projects/case studies with before/after if available
5. Contact Page - Contact form, Calendly embed, contact information${blogNote}

SONIC AGENT (AI Chat Widget):
- Enabled: ${sonicConfig.enabled}
- Voice: ${sonicConfig.voiceEnabled ? 'Enabled (audio + text)' : 'Text-only'}
- Voice Type: ${sonicConfig.voiceType || 'Professional'}
- Widget Style: Floating button (bottom-right), branded with primary color
- Context: Full access to brand information for intelligent responses
- Styling: Match brand colors and fonts

REQUIRED FEATURES:
- Fully responsive design (mobile-first)
- Dynamic meta tags and Open Graph for social sharing
- JSON-LD schema for SEO
- Image optimization and lazy loading
- Smooth animations and transitions
- Navigation bar with links to all pages
- Footer with company info and social links
- Embedded Sonic Agent chat widget on all pages

SONIC AGENT WIDGET:
- Floating bubble in bottom-right corner
- Color: ${dna.colors[0]?.hex || '#000'}
- Click to expand chat panel
- Display brand name and greeting
- Provide helpful responses based on brand context
- Optional: Voice input/output if enabled

Return a fully functional, production-ready website.`;
    }

    /**
     * Parse streaming response from Rocket.new (if applicable)
     */
    parseStreamingResponse(chunk: string): Partial<RocketNewDeploymentResult> {
        try {
            const data = JSON.parse(chunk);
            return {
                siteUrl: data.url || data.siteUrl,
                chatUrl: data.chatUrl,
            };
        } catch (e) {
            return {};
        }
    }
}

export const rocketNewService = new RocketNewService();
