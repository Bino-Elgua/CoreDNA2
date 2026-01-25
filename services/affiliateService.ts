/**
 * Affiliate Service - Complete Partner Management System
 * Handles partner onboarding, commission tracking, and payouts
 */

export interface AffiliatePartner {
  id: string;
  userId: string;
  email: string;
  name: string;
  slug: string;
  company?: string;
  tier: 'free' | 'pro' | 'hunter' | 'agency';
  commissionRate: number; // percentage
  status: 'active' | 'inactive' | 'suspended';
  bankAccount?: {
    accountHolderName: string;
    accountNumber: string;
    routingNumber?: string;
    bankCode?: string;
    iban?: string;
    swift?: string;
    country: string;
  };
  payoutMethod: 'bank' | 'stripe' | 'paypal' | 'wise';
  paypalEmail?: string;
  stripeAccountId?: string;
  wiseRecipientId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AffiliateReferral {
  id: string;
  partnerId: string;
  referredUserId: string;
  referredEmail: string;
  referredName?: string;
  referralCode: string;
  status: 'pending' | 'converted' | 'rejected' | 'refunded';
  conversionDate?: number;
  conversionValue: number; // in cents
  commissionRate: number;
  commissionAmount: number; // in cents
  paidOut: boolean;
  paidOutDate?: number;
  paidOutMethod?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Commission {
  id: string;
  partnerId: string;
  month: string; // YYYY-MM
  totalReferrals: number;
  convertedReferrals: number;
  totalCommission: number; // in cents
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paidOutDate?: number;
  transactionId?: string;
  createdAt: number;
}

class AffiliateService {
  private partners: Map<string, AffiliatePartner> = new Map();
  private referrals: Map<string, AffiliateReferral> = new Map();
  private commissions: Map<string, Commission> = new Map();

  /**
   * Initialize from localStorage
   */
  initialize() {
    try {
      const partnersData = localStorage.getItem('_affiliate_partners');
      if (partnersData) {
        const partners = JSON.parse(partnersData) as AffiliatePartner[];
        partners.forEach(p => this.partners.set(p.id, p));
      }

      const referralsData = localStorage.getItem('_affiliate_referrals');
      if (referralsData) {
        const referrals = JSON.parse(referralsData) as AffiliateReferral[];
        referrals.forEach(r => this.referrals.set(r.id, r));
      }

      const commissionsData = localStorage.getItem('_affiliate_commissions');
      if (commissionsData) {
        const commissions = JSON.parse(commissionsData) as Commission[];
        commissions.forEach(c => this.commissions.set(c.id, c));
      }

      console.log('[AffiliateService] ✓ Initialized with', this.partners.size, 'partners');
    } catch (e) {
      console.error('[AffiliateService] Initialization failed:', e);
    }
  }

  /**
   * Register new affiliate partner
   */
  async registerPartner(data: Omit<AffiliatePartner, 'id' | 'createdAt' | 'updatedAt'>): Promise<AffiliatePartner> {
    const id = `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const partner: AffiliatePartner = {
      ...data,
      id,
      commissionRate: data.commissionRate || 20,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.partners.set(id, partner);
    this.save();
    console.log('[AffiliateService] ✓ Partner registered:', partner.email);
    return partner;
  }

  /**
   * Get partner by ID
   */
  getPartner(partnerId: string): AffiliatePartner | null {
    return this.partners.get(partnerId) || null;
  }

  /**
   * Get partner by slug
   */
  getPartnerBySlug(slug: string): AffiliatePartner | null {
    for (const partner of this.partners.values()) {
      if (partner.slug === slug) return partner;
    }
    return null;
  }

  /**
   * List all partners
   */
  listPartners(status?: string): AffiliatePartner[] {
    const partners = Array.from(this.partners.values());
    if (status) {
      return partners.filter(p => p.status === status);
    }
    return partners;
  }

  /**
   * Update partner
   */
  async updatePartner(partnerId: string, updates: Partial<AffiliatePartner>): Promise<AffiliatePartner> {
    const partner = this.partners.get(partnerId);
    if (!partner) throw new Error('Partner not found');

    const updated = {
      ...partner,
      ...updates,
      id: partner.id,
      createdAt: partner.createdAt,
      updatedAt: Date.now(),
    };

    this.partners.set(partnerId, updated);
    this.save();
    console.log('[AffiliateService] ✓ Partner updated:', partnerId);
    return updated;
  }

  /**
   * Create referral link
   */
  async createReferral(partnerId: string, referredEmail: string, referredName?: string): Promise<AffiliateReferral> {
    const partner = this.partners.get(partnerId);
    if (!partner) throw new Error('Partner not found');

    const id = `referral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const referralCode = `${partner.slug}_${Date.now()}`;
    const now = Date.now();

    const referral: AffiliateReferral = {
      id,
      partnerId,
      referredUserId: '',
      referredEmail,
      referredName,
      referralCode,
      status: 'pending',
      conversionValue: 0,
      commissionRate: partner.commissionRate,
      commissionAmount: 0,
      paidOut: false,
      createdAt: now,
      updatedAt: now,
    };

    this.referrals.set(id, referral);
    this.save();
    console.log('[AffiliateService] ✓ Referral created:', referralCode);
    return referral;
  }

  /**
   * Convert referral to paid customer
   */
  async convertReferral(referralId: string, conversionValue: number, userId: string): Promise<AffiliateReferral> {
    const referral = this.referrals.get(referralId);
    if (!referral) throw new Error('Referral not found');

    const commissionAmount = Math.round(conversionValue * (referral.commissionRate / 100));
    const updated: AffiliateReferral = {
      ...referral,
      status: 'converted',
      referredUserId: userId,
      conversionValue,
      commissionAmount,
      conversionDate: Date.now(),
      updatedAt: Date.now(),
    };

    this.referrals.set(referralId, updated);
    this.updateCommissionsForPartner(referral.partnerId);
    this.save();
    console.log('[AffiliateService] ✓ Referral converted:', referralId, 'commission:', commissionAmount);
    return updated;
  }

  /**
   * Get all referrals for a partner
   */
  getPartnerReferrals(partnerId: string): AffiliateReferral[] {
    return Array.from(this.referrals.values()).filter(r => r.partnerId === partnerId);
  }

  /**
   * Get referral stats
   */
  getReferralStats(partnerId: string): {
    total: number;
    pending: number;
    converted: number;
    conversionRate: number;
    totalCommission: number;
  } {
    const referrals = this.getPartnerReferrals(partnerId);
    const total = referrals.length;
    const converted = referrals.filter(r => r.status === 'converted').length;
    const pending = referrals.filter(r => r.status === 'pending').length;
    const totalCommission = referrals.reduce((sum, r) => sum + r.commissionAmount, 0);
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    return {
      total,
      pending,
      converted,
      conversionRate,
      totalCommission,
    };
  }

  /**
   * Update commissions for a partner (calculate monthly)
   */
  private updateCommissionsForPartner(partnerId: string) {
    const referrals = this.getPartnerReferrals(partnerId);
    const byMonth: Record<string, AffiliateReferral[]> = {};

    referrals.forEach(r => {
      if (r.status === 'converted' && r.conversionDate) {
        const date = new Date(r.conversionDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!byMonth[monthKey]) byMonth[monthKey] = [];
        byMonth[monthKey].push(r);
      }
    });

    Object.entries(byMonth).forEach(([month, refs]) => {
      const commissionId = `commission_${partnerId}_${month}`;
      const totalCommission = refs.reduce((sum, r) => sum + r.commissionAmount, 0);

      const commission: Commission = {
        id: commissionId,
        partnerId,
        month,
        totalReferrals: refs.length,
        convertedReferrals: refs.filter(r => r.status === 'converted').length,
        totalCommission,
        status: 'pending',
        createdAt: Date.now(),
      };

      this.commissions.set(commissionId, commission);
    });

    this.save();
  }

  /**
   * Get commissions for partner
   */
  getPartnerCommissions(partnerId: string): Commission[] {
    return Array.from(this.commissions.values()).filter(c => c.partnerId === partnerId);
  }

  /**
   * Process payout for a commission
   */
  async processPayout(commissionId: string, partner: AffiliatePartner): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const commission = this.commissions.get(commissionId);
    if (!commission) throw new Error('Commission not found');

    try {
      let transactionId = '';

      // Process based on payout method
      if (partner.payoutMethod === 'stripe' && partner.stripeAccountId) {
        transactionId = await this.processStripePayment(partner, commission);
      } else if (partner.payoutMethod === 'paypal' && partner.paypalEmail) {
        transactionId = await this.processPayPalPayment(partner, commission);
      } else if (partner.payoutMethod === 'wise' && partner.wiseRecipientId) {
        transactionId = await this.processWisePayment(partner, commission);
      } else if (partner.payoutMethod === 'bank' && partner.bankAccount) {
        transactionId = await this.processBankPayment(partner, commission);
      } else {
        throw new Error('No valid payout method configured');
      }

      // Mark referrals as paid out
      const referrals = this.getPartnerReferrals(partner.id);
      referrals.forEach(r => {
        if (r.status === 'converted' && !r.paidOut) {
          const updated = { ...r, paidOut: true, paidOutDate: Date.now(), paidOutMethod: partner.payoutMethod };
          this.referrals.set(r.id, updated);
        }
      });

      // Update commission
      const updated = {
        ...commission,
        status: 'paid' as const,
        transactionId,
        paidOutDate: Date.now(),
      };
      this.commissions.set(commissionId, updated);

      this.save();
      console.log('[AffiliateService] ✓ Payout processed:', commissionId, 'amount:', commission.totalCommission);
      return { success: true, transactionId };
    } catch (error: any) {
      console.error('[AffiliateService] Payout failed:', error);
      const updated = { ...commission, status: 'failed' as const };
      this.commissions.set(commissionId, updated);
      this.save();
      return { success: false, error: error.message };
    }
  }

  /**
   * Process Stripe Connect payment
   */
  private async processStripePayment(partner: AffiliatePartner, commission: Commission): Promise<string> {
    // In production, this would use Stripe API
    // For now, simulate with transactionId
    const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[AffiliateService] Processing Stripe payout:', partner.stripeAccountId);
    return transactionId;
  }

  /**
   * Process PayPal payment
   */
  private async processPayPalPayment(partner: AffiliatePartner, commission: Commission): Promise<string> {
    // In production, this would use PayPal API
    const transactionId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[AffiliateService] Processing PayPal payout:', partner.paypalEmail);
    return transactionId;
  }

  /**
   * Process Wise (TransferWise) payment
   */
  private async processWisePayment(partner: AffiliatePartner, commission: Commission): Promise<string> {
    // In production, this would use Wise API
    const transactionId = `wise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[AffiliateService] Processing Wise payout:', partner.wiseRecipientId);
    return transactionId;
  }

  /**
   * Process direct bank transfer
   */
  private async processBankPayment(partner: AffiliatePartner, commission: Commission): Promise<string> {
    // In production, this would integrate with banking APIs (ACH, SEPA, etc.)
    const transactionId = `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[AffiliateService] Processing bank payout:', partner.bankAccount?.accountHolderName);
    return transactionId;
  }

  /**
   * Save to localStorage
   */
  private save() {
    try {
      localStorage.setItem('_affiliate_partners', JSON.stringify(Array.from(this.partners.values())));
      localStorage.setItem('_affiliate_referrals', JSON.stringify(Array.from(this.referrals.values())));
      localStorage.setItem('_affiliate_commissions', JSON.stringify(Array.from(this.commissions.values())));
    } catch (e) {
      console.error('[AffiliateService] Save failed:', e);
    }
  }

  /**
   * Get dashboard stats
   */
  getDashboardStats(partnerId: string): {
    totalEarned: number;
    pendingPayout: number;
    referralCount: number;
    conversionRate: number;
  } {
    const partner = this.partners.get(partnerId);
    if (!partner) return { totalEarned: 0, pendingPayout: 0, referralCount: 0, conversionRate: 0 };

    const stats = this.getReferralStats(partnerId);
    const commissions = this.getPartnerCommissions(partnerId);
    const totalEarned = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.totalCommission, 0);
    const pendingPayout = commissions.filter(c => c.status === 'pending' || c.status === 'processing').reduce((sum, c) => sum + c.totalCommission, 0);

    return {
      totalEarned,
      pendingPayout,
      referralCount: stats.converted,
      conversionRate: stats.conversionRate,
    };
  }
}

export const affiliateService = new AffiliateService();

export const initializeAffiliateService = () => {
  affiliateService.initialize();
};
