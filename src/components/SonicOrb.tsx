import { useState, useEffect, useRef } from 'react';
import { sonicCoPilot } from '../services/sonicCoPilot';
import { useVoiceListener } from '../hooks/useVoiceListener';
import { toastService } from '../services/toastService';

export function SonicOrb() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'sonic'; text: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isListening, isSupported, startListening, stopListening } = useVoiceListener({
    continuous: false,
    onResult: async (transcript) => {
      if (transcript.toLowerCase().startsWith('sonic')) {
        const command = transcript.slice(6).trim();
        await handleCommand(command);
      }
    },
    onError: (error) => {
      toastService.showToast(`Voice error: ${error}`, 'error');
    },
  });

  // Initialize Sonic on mount
  useEffect(() => {
    sonicCoPilot.initialize().then(setIsInitialized);
  }, []);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (showChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showChat]);

  // Global Escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showChat) {
        setShowChat(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showChat]);

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
      sonicCoPilot.setListening(false);
    } else {
      startListening();
      sonicCoPilot.setListening(true);
      toastService.showToast('🎤 Listening... Say "Sonic, [command]"', 'info');
    }
  };

  const handleCommand = async (input: string) => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const response = await sonicCoPilot.processCommand(input);
    setMessages(prev => [...prev, { role: 'sonic', text: response }]);

    if (isListening) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isInitialized) return null;

  return (
    <>
      {/* Accessible Backdrop Blur */}
      {showChat && (
        <div 
          onClick={() => setShowChat(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              setShowChat(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close Sonic Co-Pilot chat"
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity duration-300"
        />
      )}

      {/* Floating Orb */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChat(!showChat)}
          aria-label={showChat ? "Close Sonic Co-Pilot" : "Open Sonic Co-Pilot"}
          aria-expanded={showChat}
          className={`
            w-16 h-16 rounded-full shadow-2xl
            flex items-center justify-center
            transition-all duration-300 backdrop-blur-sm
            ${isListening 
              ? 'bg-gradient-to-r from-purple-500/90 to-blue-500/90 animate-pulse ring-4 ring-purple-400/50' 
              : 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:scale-110'
            }
          `}
        >
          <span className="text-2xl" aria-hidden="true">🎙️</span>
        </button>

        {/* Voice Toggle */}
        {isSupported && (
          <button
            onClick={toggleVoice}
            aria-label={isListening ? 'Stop voice listening' : 'Start voice listening'}
            className={`
              absolute -top-2 -left-2 w-8 h-8 rounded-full
              flex items-center justify-center shadow-lg backdrop-blur-sm
              ${isListening ? 'bg-red-500/90' : 'bg-green-500/90'}
              hover:scale-110 transition-transform
            `}
          >
            <span className="text-xs">{isListening ? '⏸️' : '▶️'}</span>
          </button>
        )}
      </div>

      {/* Glassmorphism Chat Panel */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] z-50 flex flex-col">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">🎙️</span>
                  <div>
                    <h3 className="font-bold text-white">Sonic Co-Pilot</h3>
                    <p className="text-xs text-white/70">
                      {isListening ? 'Listening...' : 'Ready to assist'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  aria-label="Close chat"
                  className="text-white/70 hover:text-white transition text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-5 space-y-4"
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {messages.length === 0 && (
                <div className="text-center text-white/60 mt-12">
                  <p className="text-sm">Say "Sonic, help" or type a command</p>
                  <p className="text-xs mt-2">Try: "Extract apple.com" or "Show stats"</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  role="article"
                  aria-label={`${msg.role === 'user' ? 'You' : 'Sonic'} said`}
                >
                  <div
                    className={`
                      max-w-[85%] px-4 py-3 rounded-2xl
                      ${msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white'
                        : 'bg-white/10 backdrop-blur-md border border-white/10 text-white'
                      }
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-5 border-t border-white/10 bg-white/5 backdrop-blur-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chatInput.trim()) {
                    handleCommand(chatInput);
                    setChatInput('');
                  }
                }}
              >
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a command..."
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Chat input"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white rounded-xl hover:from-blue-600/90 hover:to-purple-600/90 transition"
                    aria-label="Send message"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
