/**
 * Integration examples for using the inference system
 * Shows how to wrap LLM calls with inference techniques
 */

import inferenceWrapper from './inferenceWrapper';
import { GlobalSettings, BrandDNA } from '../types';

/**
 * Example 1: Wrap DNA Extraction with inference
 */
export const analyzeBrandDNAWithInference = async (
    url: string,
    settings: GlobalSettings,
    tier: 'free' | 'core' | 'pro' | 'hunter',
) => {
    inferenceWrapper.setConfig(settings, tier);

    // Simulate calling the actual Gemini service
    const result = await inferenceWrapper.wrapGeminiCall(
        async () => {
            // This would be: await analyzeBrandDNA(url)
            return {
                id: Date.now().toString(),
                name: 'Brand Name',
                websiteUrl: url,
                createdAt: Date.now(),
                // ... rest of BrandDNA
            } as BrandDNA;
        },
        'dna_extraction',
        { url },
        true // Show toast
    );

    return result;
};

/**
 * Example 2: Wrap Battle Mode with Skeleton-of-Thought
 */
export const runBattleModeWithInference = async (
    brandA: BrandDNA,
    brandB: BrandDNA,
    settings: GlobalSettings,
    tier: 'free' | 'core' | 'pro' | 'hunter',
) => {
    inferenceWrapper.setConfig(settings, tier);

    const result = await inferenceWrapper.wrapGeminiCall(
        async () => {
            // This would be: await runBattleSimulation(brandA, brandB)
            return {
                winner: 'A' as const,
                summary: 'Brand A wins',
                metrics: [],
                gapAnalysis: 'Gap analysis here',
                visualCritique: 'Visual critique here',
            };
        },
        'battle_mode',
        { brandA: brandA.name, brandB: brandB.name },
        true
    );

    return result;
};

/**
 * Example 3: Wrap Campaign Generation with Speculative Decoding
 */
export const generateCampaignWithInference = async (
    dna: BrandDNA,
    goal: string,
    settings: GlobalSettings,
    tier: 'free' | 'core' | 'pro' | 'hunter',
) => {
    inferenceWrapper.setConfig(settings, tier);

    const result = await inferenceWrapper.wrapGeminiCall(
        async () => {
            // This would be: await generateCampaignAssets(dna, goal, channels, count)
            return [
                {
                    id: 'asset-1',
                    type: 'social' as const,
                    channel: 'instagram',
                    title: 'Campaign Asset',
                    content: 'Campaign content',
                },
            ];
        },
        'campaign_gen',
        { dna: dna.name, goal },
        true
    );

    return result;
};

/**
 * Example 4: Wrap Closer Agent with Self-Consistency
 */
export const generateCloserPortfolioWithInference = async (
    lead: { name: string; email?: string },
    settings: GlobalSettings,
    tier: 'free' | 'core' | 'pro' | 'hunter',
) => {
    inferenceWrapper.setConfig(settings, tier);

    const result = await inferenceWrapper.wrapGeminiCall(
        async () => {
            // This would be: await runCloserAgent(lead)
            return {
                subjectLine: 'Subject',
                emailBody: 'Email body',
                closingScript: 'Script',
                objectionHandling: [],
                followUpSequence: [],
                report: {
                    gaps: [],
                    opportunities: [],
                    recommendedTier: 'Growth' as const,
                    tierReasoning: 'Reasoning',
                    projectedWins: '100%',
                    auditPoints: [],
                    marketContext: 'Context',
                    archetypeAnalysis: 'Analysis',
                    packages: {
                        starter: { title: 'Starter', price: '$1499', features: [] },
                        growth: { title: 'Growth', price: '$3499', features: [] },
                        dominate: { title: 'Dominate', price: '$7999', features: [] },
                    },
                },
                posts: [],
                targetEssence: {
                    detectedMission: 'Mission',
                    primaryTone: 'Tone',
                    visualDNA: 'Visual DNA',
                    primaryColors: [],
                },
            };
        },
        'closer_reply',
        { lead: lead.name, email: lead.email },
        true
    );

    return result;
};

/**
 * Example 5: Wrap Consistency Score with Self-Consistency + CoV
 */
export const calculateConsistencyScoreWithInference = async (
    dna: BrandDNA,
    settings: GlobalSettings,
    tier: 'free' | 'core' | 'pro' | 'hunter',
) => {
    inferenceWrapper.setConfig(settings, tier);

    const result = await inferenceWrapper.wrapGeminiCall(
        async () => {
            // This would be: await calculateConsistencyScore(dna)
            return {
                score: 95,
                explanation: 'Your brand is highly consistent',
                recommendations: ['Keep this up', 'More consistency needed'],
            };
        },
        'consistency_score',
        { dna: dna.name },
        true
    );

    return result;
};

/**
 * Example 6: Custom inference configuration per task
 */
export const customTaskWithInference = async (
    task: 'campaign_gen' | 'website_gen' | 'rlm_analysis' | 'battle_mode' | 'dna_extraction' | 'consistency_score' | 'closer_reply' | 'general',
    llmFn: () => Promise<any>,
    settings: GlobalSettings,
    tier: 'free' | 'core' | 'pro' | 'hunter',
    context?: Record<string, any>,
) => {
    inferenceWrapper.setConfig(settings, tier);

    const result = await inferenceWrapper.wrapGeminiCall(
        llmFn,
        task,
        context,
        true
    );

    return result;
};
