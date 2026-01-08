import { useEffect, useCallback } from 'react';
import inferenceRouter from '../services/inferenceRouter';
import inferenceWrapper from '../services/inferenceWrapper';
import { InferenceRequest } from '../services/inferenceRouter';
import { GlobalSettings } from '../types';

export const useInference = (settings: GlobalSettings | null, userTier: 'free' | 'core' | 'pro' | 'hunter' = 'pro') => {
    useEffect(() => {
        if (settings) {
            inferenceRouter.setConfig(settings.inference, userTier);
            inferenceWrapper.setConfig(settings, userTier);
        }
    }, [settings?.inference, userTier]);

    const checkInferenceAvailable = useCallback((feature: keyof typeof settings.inference) => {
        if (!settings) return false;
        const featureConfig = settings.inference[feature];
        return featureConfig && (featureConfig as any).enabled;
    }, [settings]);

    const getInferenceStatus = useCallback((task: InferenceRequest['task']) => {
        if (!settings) return 'Standard inference';
        
        const techniques = inferenceRouter.getApplicableTechniques({
            prompt: '',
            task,
            tier: userTier,
        });

        return inferenceRouter.getStatusIndicator(techniques);
    }, [settings, userTier]);

    const getApplicableTechniques = useCallback((task: InferenceRequest['task']) => {
        if (!settings) {
            return {
                useSpeculative: false,
                useSelfConsistency: false,
                useSkeletonOfThought: false,
                useChainOfVerification: false,
                numSamples: 1,
            };
        }

        return inferenceRouter.getApplicableTechniques({
            prompt: '',
            task,
            tier: userTier,
        });
    }, [settings, userTier]);

    const isFeatureAvailable = useCallback((feature: 'speculativeDecoding' | 'selfConsistency' | 'skeletonOfThought' | 'chainOfVerification'): boolean => {
        return inferenceWrapper.isFeatureAvailable(feature);
    }, []);

    return {
        checkInferenceAvailable,
        getInferenceStatus,
        getApplicableTechniques,
        isFeatureAvailable,
        inferenceRouter,
        inferenceWrapper,
    };
};
