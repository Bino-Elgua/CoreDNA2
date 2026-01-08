export type Tier = 'free' | 'pro' | 'hunter' | 'agency';

export interface TierLimits {
  support: 'community' | 'email' | 'priority' | 'dedicated';
  bulkExtraction: boolean;
  whiteLabelBranding: boolean;
  teamMembers: number | 'unlimited';
  blogSection: boolean;
  sonicAgent: 'preview' | 'live';
  rocketDeploy: boolean;
  websiteBuilder: 'preview' | 'full';
  autoPost: boolean;
  workflowEditing: boolean;
  rlm: boolean;
  inference: boolean;
  workflows: string[];
  voiceProviders: number | 'all';
  imageProviders: number | 'all';
  llmProviders: number | 'all';
  extractionsPerMonth: number | 'unlimited';
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    support: 'community',
    bulkExtraction: false,
    whiteLabelBranding: false,
    teamMembers: 1,
    blogSection: false,
    sonicAgent: 'preview',
    rocketDeploy: false,
    websiteBuilder: 'preview',
    autoPost: false,
    workflowEditing: false,
    rlm: false,
    inference: false,
    workflows: [],
    voiceProviders: 1, // OpenAI TTS
    imageProviders: 1, // Imagen 3
    llmProviders: 2, // Gemini Flash + Ollama
    extractionsPerMonth: 3,
  },
  pro: {
    support: 'email',
    bulkExtraction: false,
    whiteLabelBranding: false,
    teamMembers: 1,
    blogSection: false,
    sonicAgent: 'live',
    rocketDeploy: true,
    websiteBuilder: 'full',
    autoPost: false,
    workflowEditing: false,
    rlm: true,
    inference: true,
    workflows: ['lead-generation', 'closer-agent', 'campaign-generation', 'website-builder'],
    voiceProviders: 'all',
    imageProviders: 'all',
    llmProviders: 'all',
    extractionsPerMonth: 'unlimited',
  },
  hunter: {
    support: 'email',
    bulkExtraction: false,
    whiteLabelBranding: false,
    teamMembers: 3,
    blogSection: true,
    sonicAgent: 'live',
    rocketDeploy: true,
    websiteBuilder: 'full',
    autoPost: true,
    workflowEditing: true,
    rlm: true,
    inference: true,
    workflows: ['lead-generation', 'closer-agent', 'campaign-generation', 'website-builder'],
    voiceProviders: 'all',
    imageProviders: 'all',
    llmProviders: 'all',
    extractionsPerMonth: 'unlimited',
  },
  agency: {
    support: 'dedicated',
    bulkExtraction: true,
    whiteLabelBranding: true,
    teamMembers: 'unlimited',
    blogSection: true,
    sonicAgent: 'live',
    rocketDeploy: true,
    websiteBuilder: 'full',
    autoPost: true,
    workflowEditing: true,
    rlm: true,
    inference: true,
    workflows: ['lead-generation', 'closer-agent', 'campaign-generation', 'website-builder', 'auto-post-scheduler'],
    voiceProviders: 'all',
    imageProviders: 'all',
    llmProviders: 'all',
    extractionsPerMonth: 'unlimited',
  },
};

export const TIER_PRICES: Record<Tier, number | null> = {
  free: 0,
  pro: 49,
  hunter: 149,
  agency: null, // Custom pricing
};

export const TIER_NAMES: Record<Tier, string> = {
  free: 'Free',
  pro: 'Pro',
  hunter: 'Hunter',
  agency: 'Agency',
};

export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  free: 'Get started with brand intelligence',
  pro: 'Complete agency toolkit for professionals',
  hunter: 'Full automation for growing agencies',
  agency: 'White-label for resellers & enterprises',
};

export const TIER_BADGES: Record<Tier, string | null> = {
  free: null,
  pro: '🔥 Most Popular',
  hunter: '⚡ Best Value',
  agency: '🏢 Enterprise',
};

/**
 * Helper function to check if user has access to a feature
 */
export function hasFeatureAccess(userTier: Tier, feature: keyof TierLimits): boolean {
  const limits = TIER_LIMITS[userTier];
  const value = limits[feature];

  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (value === 'unlimited' || value === 'all') return true;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/**
 * Check extraction limit
 */
export function canExtract(userTier: Tier, currentMonthExtractions: number): boolean {
  const limit = TIER_LIMITS[userTier].extractionsPerMonth;
  if (limit === 'unlimited') return true;
  return currentMonthExtractions < limit;
}

/**
 * Check workflow access
 */
export function canUseWorkflow(userTier: Tier, workflowId: string): boolean {
  const workflows = TIER_LIMITS[userTier].workflows;
  return workflows.includes(workflowId);
}
