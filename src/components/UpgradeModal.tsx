import { Tier, TIER_PRICES, TIER_NAMES } from '../constants/tiers';

interface UpgradeModalProps {
  currentTier: Tier;
  targetTier: Tier;
  onClose: () => void;
  onConfirm: () => void;
}

export function UpgradeModal({ currentTier, targetTier, onClose, onConfirm }: UpgradeModalProps) {
  const price = TIER_PRICES[targetTier];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">
          Upgrade to {TIER_NAMES[targetTier]}?
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Current Plan:</span>
            <span>{TIER_NAMES[currentTier]}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold">New Plan:</span>
            <span className="text-blue-600 font-bold">{TIER_NAMES[targetTier]}</span>
          </div>
        </div>

        {price !== null && (
          <div className="mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                ${price}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">7-day free trial • Cancel anytime</p>
              </div>
            </div>
          </div>
        )}

        {targetTier === 'agency' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              📞 Agency tier requires custom pricing. Our team will contact you within 24 hours.
            </p>
          </div>
        )}

        <p className="text-gray-600 mb-6">
          Unlock unlimited extractions, all 70+ providers, and advanced features.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {targetTier === 'agency' ? 'Contact Sales' : 'Start Trial'}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          By upgrading, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
