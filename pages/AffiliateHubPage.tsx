import { useState, useEffect } from 'react';
import { toastService } from '../services/toastService';
import { affiliateService } from '../services/affiliateService';
import { AffiliatePartner } from '../services/affiliateService';

export function AffiliateHubPage() {
  // Hardcode to agency for demo - in production, fetch from tierService
  const [userTier] = useState<'free' | 'pro' | 'hunter' | 'agency'>('agency');
  const [partner, setPartner] = useState<AffiliatePartner | null>(null);
  const [affiliateHubEnabled, setAffiliateHubEnabled] = useState(false);
  const [dpaAccepted, setDpaAccepted] = useState(false);
  const [showDPAModal, setShowDPAModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalEarned: 0,
    pendingPayout: 0,
    referralCount: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    // Load or create partner on mount
    const loadPartner = async () => {
      const userId = localStorage.getItem('user_id') || 'user_' + Date.now();
      const partners = affiliateService.listPartners();
      let currentPartner = partners.find(p => p.userId === userId);

      if (!currentPartner) {
        // Create new partner if doesn't exist
        currentPartner = await affiliateService.registerPartner({
          userId,
          email: localStorage.getItem('user_email') || 'user@example.com',
          name: localStorage.getItem('user_name') || 'User',
          slug: 'user-' + Math.random().toString(36).substr(2, 9),
          tier: 'agency',
          commissionRate: 20,
        });
      }

      setPartner(currentPartner);
      setAffiliateHubEnabled(currentPartner.status === 'active');

      // Load dashboard stats
      const stats = affiliateService.getDashboardStats(currentPartner.id);
      setDashboardStats(stats);
    };

    loadPartner();
  }, []);

  const handleAffiliateHubToggle = async (enabled: boolean) => {
    if (enabled && !dpaAccepted) {
      setShowDPAModal(true);
      return;
    }
    if (partner) {
      await affiliateService.updatePartner(partner.id, {
        status: enabled ? 'active' : 'inactive',
      });
      setAffiliateHubEnabled(enabled);
      toastService.showToast(enabled ? '✅ Affiliate hub activated' : '❌ Affiliate hub deactivated', 'success');
    }
  };

  const handleDPAAccept = async () => {
    setDpaAccepted(true);
    setAffiliateHubEnabled(true);
    setShowDPAModal(false);
    if (partner) {
      await affiliateService.updatePartner(partner.id, { status: 'active' });
      toastService.showToast('✅ DPA accepted and affiliate hub activated', 'success');
    }
  };

  // Redirect if not agency tier
  if (userTier !== 'agency') {
    return (
      <div className="w-full p-4 md:p-8 pb-32">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center max-w-2xl">
          <h1 className="text-2xl font-bold text-amber-900 mb-2">Affiliate Hub</h1>
          <p className="text-amber-800 mb-4">
            The Affiliate Hub is exclusive to Agency tier members.
          </p>
          <p className="text-amber-700">
            Current tier: <strong>{userTier.toUpperCase()}</strong>
          </p>
          <p className="text-amber-700 mt-2">
            Upgrade to Agency tier to start earning 20% recurring commission on referrals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-6 max-w-4xl p-4 md:p-8 pb-32">
        <div>
          <h1 className="text-3xl font-bold mb-2">🏢 Affiliate Hub</h1>
          <p className="text-gray-600">
            Create your referral page and start earning commissions
          </p>
        </div>

        {/* Enable Affiliate Hub Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Enable Affiliate Hub</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Activate your affiliate program and create referral links
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={affiliateHubEnabled}
                onChange={(e) => handleAffiliateHubToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Dashboard Stats */}
        {partner && affiliateHubEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-emerald-600">${(dashboardStats.totalEarned / 100).toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Payout</p>
              <p className="text-2xl font-bold text-amber-600">${(dashboardStats.pendingPayout / 100).toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Referrals Converted</p>
              <p className="text-2xl font-bold text-blue-600">{dashboardStats.referralCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">{dashboardStats.conversionRate}%</p>
            </div>
          </div>
        )}

        {/* Affiliate Links & Info */}
         {affiliateHubEnabled && dpaAccepted && partner && (
           <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-6">
             <h2 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-4 text-lg">Your Affiliate Links</h2>

             <div className="space-y-4 mb-6">
               <div>
                 <p className="text-sm font-medium mb-2">Branded Landing Page</p>
                 <div className="bg-white dark:bg-gray-800 p-3 rounded flex items-center justify-between border border-emerald-200 dark:border-emerald-700">
                   <code className="text-sm break-all">
                     https://partner.coredna.ai/{partner.slug}
                   </code>
                   <button
                     onClick={() => {
                       navigator.clipboard.writeText(`https://partner.coredna.ai/${partner.slug}`);
                       toastService.showToast('✅ Link copied to clipboard', 'success');
                     }}
                     className="ml-3 px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
                   >
                     Copy
                   </button>
                 </div>
               </div>

               <div>
                 <p className="text-sm font-medium mb-2">Direct Referral Link</p>
                 <div className="bg-white dark:bg-gray-800 p-3 rounded flex items-center justify-between border border-emerald-200 dark:border-emerald-700">
                   <code className="text-sm break-all">
                     https://coredna.ai/r/{partner.slug}
                   </code>
                   <div className="flex gap-2 ml-3">
                     <button
                       onClick={() => {
                         navigator.clipboard.writeText(`https://coredna.ai/r/${partner.slug}`);
                         toastService.showToast('✅ Link copied to clipboard', 'success');
                       }}
                       className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
                     >
                       Copy
                     </button>
                     <button
                       onClick={() => window.open(`https://partner.coredna.ai/${partner.slug}`, '_blank')}
                       className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                     >
                       Preview
                     </button>
                   </div>
                 </div>
               </div>
             </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Compliance Summary</h3>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>✓ Tiered consent banner (company ID / marketing / sales)</li>
                <li>✓ Clearbit disclosed for IP enrichment</li>
                <li>✓ Manual approval required for outreach</li>
                <li>✓ You are data controller — CoreDNA is processor</li>
                <li>✓ GDPR/CCPA/ePrivacy compliant</li>
                <li>✓ Opt-out link on every page</li>
              </ul>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">💰 Commission Structure</p>
              <p className="text-emerald-800 dark:text-emerald-200">
                Earn <span className="font-bold">20% recurring commission</span> on all paid referrals — <span className="font-bold">lifetime</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DPA Modal - Removed component */}
      {/* {showDPAModal && (
        <DPAModal 
          onAccept={handleDPAAccept} 
          onCancel={() => setShowDPAModal(false)}
        />
      )} */}
    </div>
  );
}

export default AffiliateHubPage;
