import { useState, useCallback } from 'react';

export function useVoiceListener(
  onTranscript: (transcript: string) => void
) {
  const [isSupported] = useState(
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  );

  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    if (!isSupported) {
      console.warn('Speech Recognition API not supported');
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onTranscript(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  }, [isSupported, onTranscript]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    isSupported,
  };
}
