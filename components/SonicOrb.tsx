import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const SonicOrb: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for agency tier (demo user)
  if (!user || user.tier !== 'agency') {
    return null;
  }

  return (
    <>
      {/* Floating Orb Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg transition-all duration-300 z-40 flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500 to-blue-500 hover:shadow-2xl"
        title="Sonic Co-Pilot"
      >
        🎙️
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-96 bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Sonic Co-Pilot</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-sm">Try typing a command:</p>
              <p className="text-xs mt-2">"help" or "show stats"</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4 space-y-2 bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type command..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
