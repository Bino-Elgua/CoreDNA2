/**
 * Inference-enabled LLM wrapper
 * Wraps Gemini and other LLM calls with inference techniques
 */

import inferenceRouter from './inferenceRouter';
import toastService from './toastService';
import { InferenceRequest } from './inferenceRouter';
import { GlobalSettings } from '../types';

class InferenceWrapper {
    private settings: GlobalSettings | null = null;
    private tier: 'free' | 'core' | 'pro' | 'hunter' = 'pro';

    setConfig(settings: GlobalSettings, tier: 'free' | 'core' | 'pro' | 'hunter') {
        this.settings = settings;
        this.tier = tier;
        inferenceRouter.setConfig(settings.inference, tier);
    }

    /**
     * Wrap a Gemini call with inference techniques
     */
    async wrapGeminiCall<T>(
        geminiCallFn: () => Promise<T>,
        task: InferenceRequest['task'],
        context?: Record<string, any>,
        showToast: boolean = true
    ): Promise<T & { __inferenceMetadata?: any }> {
        if (!this.settings) {
            // Fallback if no settings
            return geminiCallFn();
        }

        const request: InferenceRequest = {
            prompt: '',
            context,
            task,
            tier: this.tier,
        };

        let toastId: string | null = null;

        try {
            const response = await inferenceRouter.wrapLLMCall(
                geminiCallFn,
                request,
                {
                    onProgress: (msg) => {
                        if (showToast) {
                            if (toastId) {
                                toastService.dismiss(toastId);
                            }
                            toastId = toastService.inferenceStart(msg);
                        }
                    },
                }
            );

            // Dismiss progress toast on success
            if (toastId) {
                toastService.dismiss(toastId);
            }

            // Show result toast if any special techniques were used
            const techniquesUsed = [
                response.usedSpeculative && '⚡ Speculative Decoding',
                response.usedSelfConsistency && '🎯 Self-Consistent',
                response.usedSkeletonOfThought && '🧩 Skeleton-of-Thought',
                response.usedChainOfVerification && '✅ Verified',
            ].filter(Boolean);

            if (techniquesUsed.length > 0 && showToast) {
                const message =
                    techniquesUsed.length === 1
                        ? `Using ${techniquesUsed[0]}`
                        : `Generated with ${techniquesUsed.join(' • ')} — ${response.processingMs}ms`;
                toastService.success(message);
            }

            // Attach inference metadata to result
            const result = response.result as any;
            if (typeof result === 'object' && result !== null) {
                result.__inferenceMetadata__ = {
                    usedSpeculative: response.usedSpeculative,
                    usedSelfConsistency: response.usedSelfConsistency,
                    usedSkeletonOfThought: response.usedSkeletonOfThought,
                    usedChainOfVerification: response.usedChainOfVerification,
                    verificationBadge: response.verificationBadge,
                    confidence: response.confidence,
                    processingMs: response.processingMs,
                };
            }

            return result;
        } catch (error) {
            if (toastId) {
                toastService.dismiss(toastId);
            }

            const errorMsg = error instanceof Error ? error.message : String(error);
            if (showToast) {
                toastService.inferenceFailed(errorMsg);
            }

            throw error;
        }
    }

    /**
     * Get inference status for UI display
     */
    getInferenceStatus(task: InferenceRequest['task']): string {
        if (!this.settings) return 'Standard inference';

        const techniques = inferenceRouter.getApplicableTechniques({
            prompt: '',
            task,
            tier: this.tier,
        });

        return inferenceRouter.getStatusIndicator(techniques);
    }

    /**
     * Check if a specific inference feature is available
     */
    isFeatureAvailable(feature: 'speculativeDecoding' | 'selfConsistency' | 'skeletonOfThought' | 'chainOfVerification'): boolean {
        return inferenceRouter.isFeatureAvailable(feature);
    }
}

export default new InferenceWrapper();
