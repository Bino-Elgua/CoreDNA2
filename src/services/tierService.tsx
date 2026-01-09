import { supabase } from '../../services/supabaseClient';
import { Tier, TIER_LIMITS, canExtract, canUseWorkflow, hasFeatureAccess } from '../constants/tiers';

export class TierService {
  /**
   * Get current user's tier and usage
   */
  async getUserTierInfo(): Promise<{
    tier: Tier;
    extractionsThisMonth: number;
    canExtract: boolean;
  }> {
    // Check for dev override in localStorage (for testing)
    const devTier = localStorage.getItem('devTier') as Tier | null;
    if (devTier && ['free', 'pro', 'hunter', 'agency'].includes(devTier)) {
      return { tier: devTier, extractionsThisMonth: 0, canExtract: true };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { tier: 'free', extractionsThisMonth: 0, canExtract: true };
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('tier, usage')
      .eq('user_id', user.id)
      .single();

    const tier = (settings?.tier as Tier) || 'free';
    const usage = settings?.usage || { extractionsThisMonth: 0, lastResetDate: new Date().toISOString() };

    // Reset monthly counter if new month
    const now = new Date();
    const lastReset = new Date(usage.lastResetDate);

    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      usage.extractionsThisMonth = 0;
      usage.lastResetDate = now.toISOString();

      await supabase
        .from('user_settings')
        .update({ usage })
        .eq('user_id', user.id);
    }

    return {
      tier,
      extractionsThisMonth: usage.extractionsThisMonth,
      canExtract: canExtract(tier, usage.extractionsThisMonth),
    };
  }

  /**
   * Check if user can perform an extraction
   */
  async checkExtractionLimit(): Promise<boolean> {
    const info = await this.getUserTierInfo();

    if (!info.canExtract) {
      const limit = TIER_LIMITS[info.tier].extractionsPerMonth;
      console.warn(
        `⏳ Monthly limit reached (${limit} extractions on ${info.tier.toUpperCase()} tier).`
      );
      return false;
    }

    return true;
  }

  /**
   * Check if user can access a workflow
   */
  async checkWorkflowAccess(workflowId: string): Promise<boolean> {
    const info = await this.getUserTierInfo();

    if (!canUseWorkflow(info.tier, workflowId)) {
      console.warn(
        `🔒 This workflow requires ${workflowId.includes('auto-post') ? 'Hunter' : 'Pro'} tier or higher.`
      );
      return false;
    }

    return true;
  }

  /**
   * Check if user has feature access
   */
  async checkFeatureAccess(feature: keyof typeof TIER_LIMITS['free']): Promise<boolean> {
    const info = await this.getUserTierInfo();
    return hasFeatureAccess(info.tier, feature);
  }

  /**
   * Increment extraction counter
   */
  async recordExtraction(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data: settings } = await supabase
      .from('user_settings')
      .select('usage')
      .eq('user_id', user.id)
      .single();

    const usage = settings?.usage || { extractionsThisMonth: 0, lastResetDate: new Date().toISOString() };
    usage.extractionsThisMonth += 1;

    await supabase
      .from('user_settings')
      .update({ usage })
      .eq('user_id', user.id);
  }

  /**
   * Get tier badge component
   */
  getTierBadge(tier: Tier): JSX.Element | null {
    const colors = {
      free: 'bg-gray-100 text-gray-700',
      pro: 'bg-blue-100 text-blue-700',
      hunter: 'bg-purple-100 text-purple-700',
      agency: 'bg-emerald-100 text-emerald-700',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[tier]}`}>
        {tier.toUpperCase()}
      </span>
    );
  }
}

export const tierService = new TierService();
