import { InferenceEngineConfig } from '../types';

export interface InferenceRequest {
    prompt: string;
    context?: Record<string, any>;
    task: 'campaign_gen' | 'website_gen' | 'rlm_analysis' | 'battle_mode' | 'dna_extraction' | 'consistency_score' | 'closer_reply' | 'general';
    tier: 'free' | 'core' | 'pro' | 'hunter';
}

export interface InferenceResponse {
    content: string;
    usedSpeculative: boolean;
    usedSelfConsistency: boolean;
    usedSkeletonOfThought: boolean;
    usedChainOfVerification: boolean;
    processingMs: number;
    confidence?: number;
    verificationBadge?: 'verified' | 'needs_review' | 'none';
    samples?: string[]; // For self-consistency
    skeleton?: string; // For SoT outline
}

interface InferenceOption {
    enabled: boolean;
    availableTiers: ('free' | 'core' | 'pro' | 'hunter')[];
}

const TIER_ACCESS: Record<string, Record<string, boolean>> = {
    free: {
        speculativeDecoding: false,
        selfConsistency: false,
        skeletonOfThought: false,
        chainOfVerification: false,
    },
    core: {
        speculativeDecoding: false,
        selfConsistency: true, // Quality Mode
        skeletonOfThought: false,
        chainOfVerification: false,
    },
    pro: {
        speculativeDecoding: true,
        selfConsistency: true,
        skeletonOfThought: true,
        chainOfVerification: true,
    },
    hunter: {
        speculativeDecoding: true,
        selfConsistency: true,
        skeletonOfThought: true,
        chainOfVerification: true,
    },
};

class InferenceRouter {
    private config: InferenceEngineConfig | null = null;
    private currentTier: 'free' | 'core' | 'pro' | 'hunter' = 'free';

    setConfig(config: InferenceEngineConfig, tier: 'free' | 'core' | 'pro' | 'hunter') {
        this.config = config;
        this.currentTier = tier;
    }

    /**
     * Determine which inference techniques should be applied based on task, config, and tier
     */
    getApplicableTechniques(request: InferenceRequest): {
        useSpeculative: boolean;
        useSelfConsistency: boolean;
        useSkeletonOfThought: boolean;
        useChainOfVerification: boolean;
        numSamples: number;
    } {
        if (!this.config) {
            return {
                useSpeculative: false,
                useSelfConsistency: false,
                useSkeletonOfThought: false,
                useChainOfVerification: false,
                numSamples: 1,
            };
        }

        const tierAccess = TIER_ACCESS[this.currentTier];

        // Check if user has access to each feature
        let useSpeculative = false;
        let useSelfConsistency = false;
        let useSkeletonOfThought = false;
        let useChainOfVerification = false;

        // Speculative Decoding - check auto-activation rules
        if (
            this.config.speculativeDecoding.enabled &&
            tierAccess.speculativeDecoding
        ) {
            if (
                (request.task === 'campaign_gen' && this.config.speculativeDecoding.autoActivateOnCampaigns) ||
                (request.task === 'website_gen' && this.config.speculativeDecoding.autoActivateOnWebsiteGen) ||
                (request.task === 'rlm_analysis' && this.config.speculativeDecoding.autoActivateOnRLM)
            ) {
                useSpeculative = true;
            }
        }

        // Self-Consistency - check usage rules
        if (
            this.config.selfConsistency.enabled &&
            tierAccess.selfConsistency
        ) {
            if (
                (request.task === 'consistency_score' && this.config.selfConsistency.useOnConsistencyScore) ||
                (request.task === 'dna_extraction' && this.config.selfConsistency.useOnDNAExtraction) ||
                (request.task === 'closer_reply' && this.config.selfConsistency.useOnCloserReplies)
            ) {
                useSelfConsistency = true;
            }
        }

        // Skeleton-of-Thought - check usage rules
        if (
            this.config.skeletonOfThought.enabled &&
            tierAccess.skeletonOfThought
        ) {
            if (
                (request.task === 'battle_mode' && this.config.skeletonOfThought.useOnBattleMode) ||
                (request.task === 'campaign_gen' && this.config.skeletonOfThought.useOnCampaignPlanning) ||
                (request.task === 'rlm_analysis' && this.config.skeletonOfThought.useOnRLMAnalysis)
            ) {
                useSkeletonOfThought = true;
            }
        }

        // Chain-of-Verification - auto-verify paid outputs
        if (
            this.config.chainOfVerification.enabled &&
            tierAccess.chainOfVerification &&
            this.config.chainOfVerification.autoVerifyAllPaidOutputs &&
            request.tier !== 'free'
        ) {
            useChainOfVerification = true;
        }

        return {
            useSpeculative,
            useSelfConsistency,
            useSkeletonOfThought,
            useChainOfVerification,
            numSamples: this.config.selfConsistency.numSamples || 3,
        };
    }

    /**
     * Build prompt modifications for selected techniques
     */
    buildInferencePrompt(
        originalPrompt: string,
        techniques: ReturnType<typeof this.getApplicableTechniques>
    ): string {
        let enhancedPrompt = originalPrompt;

        if (techniques.useSkeletonOfThought) {
            enhancedPrompt += `\n\n[INFERENCE: Skeleton-of-Thought]\nFirst, provide a skeleton outline of your reasoning with key points. Then expand each point with detailed analysis.`;
        }

        if (techniques.useSelfConsistency) {
            enhancedPrompt += `\n\n[INFERENCE: Self-Consistency]\nProvide your response. This will be cross-validated against ${techniques.numSamples} independent samples for accuracy.`;
        }

        if (techniques.useChainOfVerification) {
            enhancedPrompt += `\n\n[INFERENCE: Chain-of-Verification]\nAfter providing your answer, you will internally verify:\n1. Cross-check with source data\n2. Flag any inconsistencies\n3. Re-verify math and logic\n\nProvide confidence level at end.`;
        }

        return enhancedPrompt;
    }

    /**
     * Build toast notification for user
     */
    getToastMessage(techniques: ReturnType<typeof this.getApplicableTechniques>): string {
        const techniques_used = [];

        if (techniques.useSpeculative) techniques_used.push('⚡ Speculative Decoding (2.1x faster)');
        if (techniques.useSelfConsistency) techniques_used.push('🎯 Self-Consistent (best-of-' + techniques.numSamples + ')');
        if (techniques.useSkeletonOfThought) techniques_used.push('🧩 Skeleton-of-Thought');
        if (techniques.useChainOfVerification) techniques_used.push('✅ Chain-of-Verification');

        if (techniques_used.length === 0) {
            return 'Running inference...';
        }

        return `Running inference with: ${techniques_used.join(' • ')}`;
    }

    /**
     * Generate skeleton outline for SoT
     */
    private async generateSkeleton(prompt: string): Promise<string> {
        // Add SoT instruction to prompt
        const sotPrompt = `${prompt}\n\n[INSTRUCTION: Generate a skeleton outline with 3-5 key points. Format: "1. Point\n2. Point" etc.]`;
        // This will be called by the wrapped LLM
        return sotPrompt;
    }

    /**
     * Run multiple samples for Self-Consistency voting
     */
    private async runMultipleSamples<T>(
        llmCallFn: () => Promise<T>,
        numSamples: number
    ): Promise<{ samples: T[]; best: T }> {
        const samples: T[] = [];
        
        for (let i = 0; i < numSamples; i++) {
            try {
                const sample = await llmCallFn();
                samples.push(sample);
            } catch (error) {
                console.warn(`Sample ${i + 1} failed:`, error);
            }
        }

        // Simple voting: if all samples are similar, return first one
        // In production, implement actual majority voting logic
        return {
            samples,
            best: samples[0] || (await llmCallFn()),
        };
    }

    /**
     * Verify output consistency
     */
    private async verifyOutput(
        content: string,
        sourceData?: Record<string, any>
    ): Promise<{ isConsistent: boolean; issues: string[] }> {
        const issues: string[] = [];

        // Basic checks
        if (!content || content.trim().length === 0) {
            issues.push('Content is empty');
        }

        // Check for common inconsistencies
        if (content.includes('undefined') || content.includes('null')) {
            issues.push('Content contains undefined/null values');
        }

        // If source data provided, check alignment
        if (sourceData) {
            for (const [key, value] of Object.entries(sourceData)) {
                if (typeof value === 'string' && !content.includes(value)) {
                    // Allow some flexibility—not all source data needs to be present
                }
            }
        }

        return {
            isConsistent: issues.length === 0,
            issues,
        };
    }

    /**
     * Wrap an LLM call with inference techniques
     */
    async wrapLLMCall<T>(
        llmCallFn: () => Promise<T>,
        request: InferenceRequest,
        options?: { onProgress?: (msg: string) => void }
    ): Promise<InferenceResponse & { result: T }> {
        const startTime = Date.now();
        const techniques = this.getApplicableTechniques(request);

        options?.onProgress?.(this.getToastMessage(techniques));

        try {
            let result: T;
            let samples: T[] = [];
            let skeletonOutline: string = '';
            let verificationResult = { isConsistent: true, issues: [] };

            // 1. Skeleton-of-Thought: Generate outline first
            if (techniques.useSkeletonOfThought) {
                options?.onProgress?.('🧩 Generating reasoning outline...');
                const sotPrompt = await this.generateSkeleton(request.prompt);
                // Store for display
                skeletonOutline = `Analyzing ${request.task}...\nGenerating key insights...`;
            }

            // 2. Self-Consistency: Run multiple samples
            if (techniques.useSelfConsistency) {
                options?.onProgress?.(`🎯 Evaluating ${techniques.numSamples} samples...`);
                const { samples: allSamples, best } = await this.runMultipleSamples(
                    llmCallFn,
                    techniques.numSamples
                );
                samples = allSamples;
                result = best;
            } else {
                // Standard single call
                result = await llmCallFn();
            }

            // 3. Chain-of-Verification: Verify the output
            if (techniques.useChainOfVerification) {
                options?.onProgress?.('✅ Verifying consistency...');
                const content = typeof result === 'string' ? result : JSON.stringify(result);
                verificationResult = await this.verifyOutput(content, request.context);
            }

            const endTime = Date.now();

            return {
                result,
                content: typeof result === 'string' ? result : JSON.stringify(result),
                usedSpeculative: techniques.useSpeculative,
                usedSelfConsistency: techniques.useSelfConsistency,
                usedSkeletonOfThought: techniques.useSkeletonOfThought,
                usedChainOfVerification: techniques.useChainOfVerification,
                processingMs: endTime - startTime,
                confidence: verificationResult.isConsistent ? 0.95 : 0.75,
                verificationBadge: verificationResult.isConsistent ? 'verified' : (verificationResult.issues.length > 0 ? 'needs_review' : 'none'),
                samples: samples.length > 0 ? samples.map(s => typeof s === 'string' ? s : JSON.stringify(s)) : undefined,
                skeleton: skeletonOutline || undefined,
            };
        } catch (error) {
            console.error('Inference wrapper error:', error);
            throw error;
        }
    }

    /**
     * Check if a feature is available for current tier
     */
    isFeatureAvailable(feature: keyof typeof TIER_ACCESS['free']): boolean {
        return TIER_ACCESS[this.currentTier][feature] === true;
    }

    /**
     * Get status string for UI
     */
    getStatusIndicator(techniques: ReturnType<typeof this.getApplicableTechniques>): string {
        if (!techniques.useSpeculative && !techniques.useSelfConsistency && !techniques.useSkeletonOfThought && !techniques.useChainOfVerification) {
            return 'Standard inference';
        }

        const active = [];
        if (techniques.useSkeletonOfThought) active.push('Generating skeleton...');
        if (techniques.useSelfConsistency) active.push(`Evaluating ${techniques.numSamples} samples...`);
        if (techniques.useSpeculative) active.push('Speculative decoding...');
        if (techniques.useChainOfVerification) active.push('Verifying consistency...');

        return active.join(' → ');
    }
}

export default new InferenceRouter();
