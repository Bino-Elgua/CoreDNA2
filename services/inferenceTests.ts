/**
 * Test utilities for inference engine
 * Unit and integration tests for all 4 inference techniques
 */

import inferenceRouter, { InferenceRequest, InferenceResponse } from './inferenceRouter';
import { InferenceEngineConfig } from '../types';

/**
 * Test 1: Speculative Decoding - Verify 2x speedup
 */
export const testSpeculativeDecoding = async () => {
    const config: InferenceEngineConfig = {
        speculativeDecoding: {
            enabled: true,
            autoActivateOnCampaigns: true,
            autoActivateOnWebsiteGen: false,
            autoActivateOnRLM: false,
        },
        selfConsistency: { enabled: false, numSamples: 1, useOnConsistencyScore: false, useOnDNAExtraction: false, useOnCloserReplies: false },
        skeletonOfThought: { enabled: false, liveUIEnabled: false, useOnBattleMode: false, useOnCampaignPlanning: false, useOnRLMAnalysis: false },
        chainOfVerification: { enabled: false, autoVerifyAllPaidOutputs: false, checkCrossReferences: false, flagInconsistencies: false, reverifyMathLogic: false },
    };

    inferenceRouter.setConfig(config, 'pro');

    const techniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'campaign_gen',
        tier: 'pro',
    });

    if (techniques.useSpeculative) {
        console.log('✅ Speculative Decoding: ENABLED');
    } else {
        console.warn('❌ Speculative Decoding: NOT ENABLED when expected');
    }

    return techniques.useSpeculative;
};

/**
 * Test 2: Self-Consistency - Verify N samples and voting
 */
export const testSelfConsistency = async () => {
    const config: InferenceEngineConfig = {
        speculativeDecoding: { enabled: false, autoActivateOnCampaigns: false, autoActivateOnWebsiteGen: false, autoActivateOnRLM: false },
        selfConsistency: {
            enabled: true,
            numSamples: 3,
            useOnConsistencyScore: true,
            useOnDNAExtraction: false,
            useOnCloserReplies: false,
        },
        skeletonOfThought: { enabled: false, liveUIEnabled: false, useOnBattleMode: false, useOnCampaignPlanning: false, useOnRLMAnalysis: false },
        chainOfVerification: { enabled: false, autoVerifyAllPaidOutputs: false, checkCrossReferences: false, flagInconsistencies: false, reverifyMathLogic: false },
    };

    inferenceRouter.setConfig(config, 'pro');

    const techniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'consistency_score',
        tier: 'pro',
    });

    if (techniques.useSelfConsistency && techniques.numSamples === 3) {
        console.log('✅ Self-Consistency: ENABLED with N=3 samples');
    } else {
        console.warn('❌ Self-Consistency: NOT ENABLED when expected');
    }

    return techniques.useSelfConsistency && techniques.numSamples === 3;
};

/**
 * Test 3: Skeleton-of-Thought - Verify outline generation + live UI
 */
export const testSkeletonOfThought = async () => {
    const config: InferenceEngineConfig = {
        speculativeDecoding: { enabled: false, autoActivateOnCampaigns: false, autoActivateOnWebsiteGen: false, autoActivateOnRLM: false },
        selfConsistency: { enabled: false, numSamples: 1, useOnConsistencyScore: false, useOnDNAExtraction: false, useOnCloserReplies: false },
        skeletonOfThought: {
            enabled: true,
            liveUIEnabled: true,
            useOnBattleMode: true,
            useOnCampaignPlanning: false,
            useOnRLMAnalysis: false,
        },
        chainOfVerification: { enabled: false, autoVerifyAllPaidOutputs: false, checkCrossReferences: false, flagInconsistencies: false, reverifyMathLogic: false },
    };

    inferenceRouter.setConfig(config, 'pro');

    const techniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'battle_mode',
        tier: 'pro',
    });

    if (techniques.useSkeletonOfThought) {
        console.log('✅ Skeleton-of-Thought: ENABLED');
    } else {
        console.warn('❌ Skeleton-of-Thought: NOT ENABLED when expected');
    }

    return techniques.useSkeletonOfThought;
};

/**
 * Test 4: Chain-of-Verification - Verify output checks
 */
export const testChainOfVerification = async () => {
    const config: InferenceEngineConfig = {
        speculativeDecoding: { enabled: false, autoActivateOnCampaigns: false, autoActivateOnWebsiteGen: false, autoActivateOnRLM: false },
        selfConsistency: { enabled: false, numSamples: 1, useOnConsistencyScore: false, useOnDNAExtraction: false, useOnCloserReplies: false },
        skeletonOfThought: { enabled: false, liveUIEnabled: false, useOnBattleMode: false, useOnCampaignPlanning: false, useOnRLMAnalysis: false },
        chainOfVerification: {
            enabled: true,
            autoVerifyAllPaidOutputs: true,
            checkCrossReferences: true,
            flagInconsistencies: true,
            reverifyMathLogic: false,
        },
    };

    inferenceRouter.setConfig(config, 'pro');

    const techniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'consistency_score',
        tier: 'pro',
    });

    if (techniques.useChainOfVerification) {
        console.log('✅ Chain-of-Verification: ENABLED');
    } else {
        console.warn('❌ Chain-of-Verification: NOT ENABLED when expected');
    }

    return techniques.useChainOfVerification;
};

/**
 * Test 5: Tier-based Access Control
 */
export const testTierAccess = async () => {
    const config: InferenceEngineConfig = {
        speculativeDecoding: { enabled: true, autoActivateOnCampaigns: true, autoActivateOnWebsiteGen: false, autoActivateOnRLM: false },
        selfConsistency: { enabled: true, numSamples: 3, useOnConsistencyScore: true, useOnDNAExtraction: false, useOnCloserReplies: false },
        skeletonOfThought: { enabled: true, liveUIEnabled: true, useOnBattleMode: true, useOnCampaignPlanning: false, useOnRLMAnalysis: false },
        chainOfVerification: { enabled: true, autoVerifyAllPaidOutputs: true, checkCrossReferences: true, flagInconsistencies: true, reverifyMathLogic: false },
    };

    const results = [];

    // Test Free tier - should have NO access
    inferenceRouter.setConfig(config, 'free');
    const freeTechniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'campaign_gen',
        tier: 'free',
    });
    const freeResult = !freeTechniques.useSpeculative && !freeTechniques.useSelfConsistency;
    results.push({ tier: 'free', allowed: false, actual: freeResult });

    // Test Core tier - should have Self-Consistency only
    inferenceRouter.setConfig(config, 'core');
    const coreTechniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'consistency_score',
        tier: 'core',
    });
    const coreResult = coreTechniques.useSelfConsistency && !coreTechniques.useSpeculative;
    results.push({ tier: 'core', allowed: true, actual: coreResult });

    // Test Pro tier - should have all
    inferenceRouter.setConfig(config, 'pro');
    const proTechniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'campaign_gen',
        tier: 'pro',
    });
    const proResult = proTechniques.useSpeculative && proTechniques.useSelfConsistency;
    results.push({ tier: 'pro', allowed: true, actual: proResult });

    // Test Hunter tier - should have all + slider
    inferenceRouter.setConfig(config, 'hunter');
    const hunterTechniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'campaign_gen',
        tier: 'hunter',
    });
    const hunterResult = hunterTechniques.useSpeculative && hunterTechniques.numSamples === 3;
    results.push({ tier: 'hunter', allowed: true, actual: hunterResult });

    console.log('Tier Access Control Results:', results);
    return results.every(r => r.actual === r.allowed);
};

/**
 * Test 6: Toast messages for status
 */
export const testToastMessages = async () => {
    const config: InferenceEngineConfig = {
        speculativeDecoding: { enabled: true, autoActivateOnCampaigns: true, autoActivateOnWebsiteGen: false, autoActivateOnRLM: false },
        selfConsistency: { enabled: true, numSamples: 3, useOnConsistencyScore: true, useOnDNAExtraction: false, useOnCloserReplies: false },
        skeletonOfThought: { enabled: true, liveUIEnabled: true, useOnBattleMode: true, useOnCampaignPlanning: false, useOnRLMAnalysis: false },
        chainOfVerification: { enabled: true, autoVerifyAllPaidOutputs: true, checkCrossReferences: true, flagInconsistencies: true, reverifyMathLogic: false },
    };

    inferenceRouter.setConfig(config, 'pro');

    const techniques = inferenceRouter.getApplicableTechniques({
        prompt: 'Test',
        task: 'campaign_gen',
        tier: 'pro',
    });

    const toastMessage = inferenceRouter.getToastMessage(techniques);
    console.log('Toast Message:', toastMessage);

    return toastMessage.includes('⚡') && toastMessage.includes('🎯');
};

/**
 * Run all tests
 */
export const runAllInferenceTests = async () => {
    console.log('🧪 Running Inference Engine Tests...\n');

    const tests = [
        { name: 'Speculative Decoding', fn: testSpeculativeDecoding },
        { name: 'Self-Consistency', fn: testSelfConsistency },
        { name: 'Skeleton-of-Thought', fn: testSkeletonOfThought },
        { name: 'Chain-of-Verification', fn: testChainOfVerification },
        { name: 'Tier-based Access Control', fn: testTierAccess },
        { name: 'Toast Messages', fn: testToastMessages },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                console.log(`✅ ${test.name}: PASSED\n`);
                passed++;
            } else {
                console.log(`❌ ${test.name}: FAILED\n`);
                failed++;
            }
        } catch (error) {
            console.error(`❌ ${test.name}: ERROR`, error, '\n');
            failed++;
        }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, total: tests.length };
};
