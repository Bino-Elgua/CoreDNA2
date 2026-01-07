import { useEffect } from 'react';
import inferenceRouter from '../services/inferenceRouter';
import { InferenceRequest } from '../services/inferenceRouter';
import { GlobalSettings } from '../types';

export const useInference = (settings: GlobalSettings | null) => {
    useEffect(() => {
        if (settings) {
            // Determine tier based on user profile
            // For now, default to 'pro' - in production this comes from user.tier
            const tier: 'free' | 'core' | 'pro' | 'hunter' = 'pro';
            inferenceRouter.setConfig(settings.inference, tier);
        }
    }, [settings?.inference]);

    const checkInferenceAvailable = (feature: keyof typeof settings.inference) => {
        if (!settings) return false;
        const featureConfig = settings.inference[feature];
        return featureConfig && (featureConfig as any).enabled;
    };

    const getInferenceStatus = (task: InferenceRequest['task']) => {
        if (!settings) return 'Standard inference';
        
        const techniques = inferenceRouter.getApplicableTechniques({
            prompt: '',
            task,
            tier: 'pro',
        });

        return inferenceRouter.getStatusIndicator(techniques);
    };

    return {
        checkInferenceAvailable,
        getInferenceStatus,
        inferenceRouter,
    };
};
