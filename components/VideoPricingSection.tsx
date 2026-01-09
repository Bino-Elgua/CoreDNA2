/**
 * Phase 5: Video Pricing Section Component
 * Displays tier-based video generation pricing and credit packages
 */

import React from 'react';
import { motion } from 'framer-motion';

interface VideoPricingSectionProps {
  userTier: 'free' | 'pro' | 'hunter' | 'agency';
  onUpgrade?: (targetTier: string) => void;
}

const VideoPricingSection: React.FC<VideoPricingSectionProps> = ({ userTier, onUpgrade }) => {
  const tiers = [
    {
      tier: 'free',
      name: 'Free',
      monthlyLimit: '5 videos',
      engines: 'LTX-2',
      costPerVideo: 'Free',
      note: 'Social-optimized shorts (15 seconds, vertical)',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    {
      tier: 'pro',
      name: 'Pro',
      monthlyLimit: '50 videos',
      engines: 'LTX-2',
      costPerVideo: 'Free',
      note: 'LTX-2 optimized for content creators',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      tier: 'hunter',
      name: 'Hunter',
      monthlyLimit: 'Unlimited',
      engines: 'LTX-2 + Sora 2 + Veo 3',
      costPerVideo: 'Credit-based',
      note: 'Premium engines with credit system',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      creditPacks: [
        { credits: 100, price: 19 },
        { credits: 500, price: 79 },
        { credits: 1000, price: 139 },
      ],
    },
    {
      tier: 'agency',
      name: 'Agency',
      monthlyLimit: 'Unlimited',
      engines: 'LTX-2 + Sora 2 + Veo 3',
      costPerVideo: 'Free',
      note: 'Unlimited access to all engines',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-2">Video Generation Pricing</h2>
      <p className="text-center text-gray-600 mb-12">
        Transform your campaign assets into engaging videos with transparent, tier-based pricing.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-4 text-left">Tier</th>
              <th className="border p-4 text-left">Engine</th>
              <th className="border p-4 text-left">Monthly Limit</th>
              <th className="border p-4 text-left">Credits per Video</th>
              <th className="border p-4 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t) => (
              <motion.tr
                key={t.tier}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`border ${
                  userTier === t.tier ? 'bg-yellow-100 border-yellow-500' : ''
                }`}
              >
                <td className={`border p-4 font-bold ${t.color}`}>{t.name}</td>
                <td className="border p-4 text-sm">{t.engines}</td>
                <td className="border p-4">{t.monthlyLimit}</td>
                <td className="border p-4 font-mono">{t.costPerVideo}</td>
                <td className="border p-4 text-xs">{t.note}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Video Engine Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="font-bold text-lg mb-4">Video Engine Credits</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Engine</th>
                <th className="text-right p-2">Cost</th>
                <th className="text-left p-2">Quality</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">LTX-2 (open-source)</td>
                <td className="text-right p-2 font-mono">1 credit</td>
                <td className="p-2 text-gray-600">Good (~$0.04/sec)</td>
              </tr>
              <tr>
                <td className="p-2">Sora 2 Pro (OpenAI)</td>
                <td className="text-right p-2 font-mono">5 credits</td>
                <td className="p-2 text-gray-600">Cinematic</td>
              </tr>
              <tr>
                <td className="p-2">Veo 3 (Google)</td>
                <td className="text-right p-2 font-mono">5 credits</td>
                <td className="p-2 text-gray-600">Superior physics</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* Credit Packages (Hunter) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-6"
        >
          <h3 className="font-bold text-lg mb-4">Hunter: Credit Packages</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-white rounded border border-purple-100">
              <span>100 credits</span>
              <strong className="text-purple-600">$19</strong>
            </div>
            <div className="flex justify-between p-3 bg-white rounded border border-purple-100">
              <span>500 credits</span>
              <strong className="text-purple-600">$79</strong>
            </div>
            <div className="flex justify-between p-3 bg-white rounded border border-purple-100">
              <span>1000 credits</span>
              <strong className="text-purple-600">$139</strong>
            </div>
          </div>
          {userTier === 'hunter' && onUpgrade && (
            <button
              onClick={() => onUpgrade('hunter')}
              className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Buy Credits
            </button>
          )}
        </motion.div>
      </div>

      {/* Legal Disclosures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6"
      >
        <h3 className="font-bold text-lg mb-4">Legal Disclosures & Output Ownership</h3>
        <ul className="space-y-3 text-sm text-gray-700">
          <li>
            <strong>LTX-2 (open-source):</strong> Custom community license (free for &lt; $10M ARR). You own
            all output.
          </li>
          <li>
            <strong>Sora 2 Pro (OpenAI):</strong> You own output per API terms. Audio generated is
            user-owned.
          </li>
          <li>
            <strong>Veo 3 (Google):</strong> You own output per API terms. We&apos;re well under commercial
            license thresholds.
          </li>
          <li>
            <strong>Transparency:</strong> Users see engine name + limits upfront. All costs are
            transparent.
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default VideoPricingSection;
