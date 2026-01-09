import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../services/supabaseClient';
import { recordDPAAcceptance } from '../services/affiliateTracking';

export function DPAModal({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [dpaConfirmed, setDpaConfirmed] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      // Call onAccept immediately
      onAccept();
      
      // Try to record in background (don't block)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          const ip = ipData.ip;
          await recordDPAAcceptance(user.id, ip);
        }
      } catch (error) {
        console.error('Failed to record DPA acceptance:', error);
        // Continue anyway - don't block the user
      }
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Data Processing Agreement Required</h2>

          <p className="text-gray-800 mb-6">
            To enable the Affiliate Hub, you must accept our Data Processing Agreement.
            You are the <strong>data controller</strong> for visitor data. CoreDNA is the <strong>processor</strong>.
          </p>

          <div className="bg-gray-50 border rounded-lg p-6 mb-6 text-sm max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-3 text-gray-900">Key Obligations</h3>
            <ul className="space-y-2 text-gray-800">
              <li>• You obtain valid consent from visitors</li>
              <li>• CoreDNA processes data only per your instructions</li>
              <li>• We use Clearbit for company identification</li>
              <li>• No personal data without explicit consent</li>
              <li>• You honor opt-out requests within 48 hours</li>
              <li>• Full DPA: <a href="/legal/affiliate-dpa" className="underline">View complete agreement</a></li>
            </ul>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <div className="flex gap-4">
              <input
                type="checkbox"
                id="dpa-confirm"
                checked={dpaConfirmed}
                onChange={(e) => setDpaConfirmed(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="dpa-confirm" className="text-sm text-gray-800">
                I accept the Data Processing Agreement and understand my responsibilities as data controller.
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!dpaConfirmed || loading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg disabled:opacity-50 font-semibold"
            >
              {loading ? 'Accepting...' : 'Accept DPA & Enable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
