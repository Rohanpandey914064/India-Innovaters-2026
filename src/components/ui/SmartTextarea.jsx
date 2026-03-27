import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export function SmartTextarea({ className, value, onChange, onVoiceUpdate, placeholder, ...props }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceUpdate) {
            onVoiceUpdate(transcript);
        } else if (onChange) {
            const e = { target: { value: transcript }, currentTarget: { value: transcript } };
            onChange(e);
        }
      };
      recognition.onerror = (e) => {
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => {
        if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [onVoiceUpdate, onChange]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try { recognitionRef.current?.start(); } catch (e) { console.warn(e); }
    }
  };

  return (
    <div className={cn("relative flex w-full", className)}>
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn("pr-10 w-full", className)}
        {...props}
      />
      {recognitionRef.current && (
        <button
          type="button"
          onClick={toggleListening}
          className="absolute right-3 bottom-3 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors focus:outline-none"
          title={t(isListening ? 'Stop listening' : 'Start voice input')}
        >
          {isListening ? (
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <Mic className="relative inline-flex rounded-full h-4 w-4 text-red-500" />
            </span>
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
