import { BrandDNA, LeadProfile, CloserPortfolio, BattleReport } from '../types';

interface RLMConfig {
    enabled: boolean;
    rootModel: string;
    recursiveModel: string;
    maxDepth: number;
    contextWindow: number;
}

interface RLMRequest {
    task: 'extract_dna' | 'battle_simulation' | 'closer_agent' | 'lead_hunter' | 'full_crawl';
    data: any;
    config: RLMConfig;
}

interface RLMResponse {
    result: any;
    depth: number;
    tokensUsed: number;
    timestamp: number;
}

/**
 * RLM Service - Handles recursive language model requests for infinite context tasks
 * Uses recursive decomposition for:
 * - Full website crawls (ExtractPage)
 * - Deep competitive analysis (BattleMode)
 * - Extended Closer Agent history
 * - Complex multi-level context processing
 */
class RLMService {
    private baseUrl = '/api/rlm'; // Backend endpoint for RLM processing
    private requestQueue: RLMRequest[] = [];
    private isProcessing = false;

    /**
     * Process a long-context task through RLM
     */
    async processWithRLM<T>(request: RLMRequest): Promise<RLMResponse> {
        if (!request.config.enabled) {
            throw new Error('RLM Mode is disabled');
        }

        this.requestQueue.push(request);
        return this.executeQueue();
    }

    /**
     * Execute queued RLM requests
     */
    private async executeQueue(): Promise<RLMResponse> {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return Promise.reject('Queue is empty or processing');
        }

        this.isProcessing = true;
        const request = this.requestQueue.shift()!;

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`RLM Error: ${response.statusText}`);
            }

            const data = await response.json() as RLMResponse;
            return data;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Extract full website DNA with infinite context (for ExtractPage crawl)
     */
    async extractFullDNA(
        url: string,
        brandName: string,
        rlmConfig: RLMConfig
    ): Promise<BrandDNA> {
        const request: RLMRequest = {
            task: 'extract_dna',
            data: { url, brandName },
            config: rlmConfig,
        };

        const response = await this.processWithRLM(request);
        return response.result as BrandDNA;
    }

    /**
     * Run deep competitive battle simulation across multiple competitors
     */
    async runDeepBattleSimulation(
        brandA: BrandDNA,
        brandB: BrandDNA,
        rlmConfig: RLMConfig
    ): Promise<BattleReport> {
        const request: RLMRequest = {
            task: 'battle_simulation',
            data: { brandA, brandB },
            config: rlmConfig,
        };

        const response = await this.processWithRLM(request);
        return response.result as BattleReport;
    }

    /**
     * Generate extended Closer Agent portfolio with full conversation history
     */
    async runExtendedCloserAgent(
        lead: LeadProfile,
        brandDNA: BrandDNA | undefined,
        rlmConfig: RLMConfig
    ): Promise<CloserPortfolio> {
        const request: RLMRequest = {
            task: 'closer_agent',
            data: { lead, brandDNA },
            config: rlmConfig,
        };

        const response = await this.processWithRLM(request);
        return response.result as CloserPortfolio;
    }

    /**
     * Deep lead analysis with extended context
     */
    async runDeepLeadHunter(
        niche: string,
        latitude: number,
        longitude: number,
        rlmConfig: RLMConfig
    ): Promise<LeadProfile[]> {
        const request: RLMRequest = {
            task: 'lead_hunter',
            data: { niche, latitude, longitude },
            config: rlmConfig,
        };

        const response = await this.processWithRLM(request);
        return response.result as LeadProfile[];
    }

    /**
     * Full website crawl with complete content extraction
     */
    async fullWebsiteCrawl(
        url: string,
        rlmConfig: RLMConfig
    ): Promise<{ content: string; metadata: Record<string, any> }> {
        const request: RLMRequest = {
            task: 'full_crawl',
            data: { url },
            config: rlmConfig,
        };

        const response = await this.processWithRLM(request);
        return response.result;
    }

    /**
     * Check if RLM processing is active
     */
    isRLMActive(config: RLMConfig): boolean {
        return config.enabled && config.maxDepth > 0 && config.contextWindow > 0;
    }

    /**
     * Get RLM status indicator
     */
    getRLMStatus(config: RLMConfig): string {
        if (!config.enabled) return 'RLM Disabled';
        return `RLM Active — Processing unbounded context (${config.maxDepth} depth, ${config.contextWindow} tokens)`;
    }

    /**
     * Validate RLM configuration
     */
    validateRLMConfig(config: RLMConfig): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (config.enabled) {
            if (!config.rootModel) errors.push('Root model not selected');
            if (!config.recursiveModel) errors.push('Recursive model not selected');
            if (config.maxDepth < 1 || config.maxDepth > 10) errors.push('Max depth must be 1-10');
            if (config.contextWindow < 50000 || config.contextWindow > 1000000) {
                errors.push('Context window must be 50k-1M tokens');
            }
        }

        return { valid: errors.length === 0, errors };
    }
}

export default new RLMService();
