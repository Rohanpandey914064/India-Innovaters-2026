import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export const VoiceButton = ({ onTranscript, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { language } = useLanguage();
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Map language code to SpeechRecognition format (e.g. 'hi' -> 'hi-IN')
    recognition.lang = language === 'en' ? 'en-IN' : `${language}-IN`;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language, onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }, [isListening]);

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      className={cn(
        "h-8 w-8 rounded-full transition-all duration-300",
        isListening ? "bg-red-500/10 text-red-600 animate-pulse" : "text-muted-foreground hover:text-primary",
        className
      )}
    >
      {isListening ? <Mic className="h-4 w-4 animate-bounce" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};
