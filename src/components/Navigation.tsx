import { useEffect, useState } from 'react';
import { tierService } from '../services/tierService';
import type { Tier } from '../constants/tiers';

function Navigation() {
  const [userTier, setUserTier] = useState<Tier>('free');

  useEffect(() => {
    tierService.getUserTierInfo().then(info => setUserTier(info.tier));
  }, []);

  const tierColors = {
    free: 'bg-gray-100 text-gray-700',
    pro: 'bg-blue-100 text-blue-700',
    hunter: 'bg-purple-100 text-purple-700',
    agency: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <nav className="flex items-center justify-between p-4">
      {/* ... existing nav items ... */}

      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierColors[userTier]}`}>
          {userTier.toUpperCase()}
        </span>

        {userTier === 'free' && (
          <a 
            href="/pricing" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Upgrade
          </a>
        )}

        {/* User profile dropdown */}
      </div>
    </nav>
  );
}

export default Navigation;
