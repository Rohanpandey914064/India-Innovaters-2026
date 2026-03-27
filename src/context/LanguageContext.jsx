import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { translateText } from '../services/SarvamService';
import { translateWithGemini } from '../services/GeminiService';
import { UI_LANGUAGES, DICTIONARIES } from './translations';

const LanguageContext = createContext();
const TRANSLATION_CACHE_VERSION = 'v12';

const STATIC_EN = {
  notifications: 'Notifications',
  notifMarkAllRead: 'Mark all as read',
  notifAllCaughtUp: 'All caught up!',
  notifViewDashboard: 'View Dashboard',
  navFeed: 'Feed',
  navMap: 'Map',
  navServices: 'Services',
  navDashboard: 'Dashboard',
  navProfile: 'Profile',
  reportIssue: 'Report Issue',
  feed: 'Feed',
  map: 'Map',
  services: 'Services',
  dashboard: 'Dashboard',
  profileSettings: 'Profile Settings',
  logout: 'Log out',
  login: 'Log in',
  signup: 'Sign up',
  language: 'Language',
  toggleTheme: 'Toggle theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeEyeComfort: 'Eye Comfort',
  infrastructure: 'Infrastructure',
  electricity: 'Electricity',
  water: 'Water',
  sanitation: 'Sanitation',
  statusReported: 'Reported'
};

const SLEEP_MS = 400; 

const MOJIBAKE_MARKERS = /(?:Ã.|Â.|â€|ðŸ|à.|Ù.|Ø.|�)/;

function countMojibakeNoise(value) {
  return (String(value || '').match(MOJIBAKE_MARKERS) || []).length;
}

function repairMojibake(value) {
  if (typeof value !== 'string' || !value) return value;
  if (!MOJIBAKE_MARKERS.test(value)) return value;

  try {
    const bytes = Uint8Array.from(Array.from(value), (ch) => ch.charCodeAt(0) & 0xff);
    const decodedViaBytes = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    let decodedViaLatin1 = value;
    try {
      // Common fix path for UTF-8 text that was decoded as Latin-1/Windows-1252.
      decodedViaLatin1 = decodeURIComponent(escape(value));
    } catch {
      decodedViaLatin1 = value;
    }

    const candidates = [value, decodedViaBytes, decodedViaLatin1];
    const best = candidates.sort((a, b) => countMojibakeNoise(a) - countMojibakeNoise(b))[0];
    return best;
  } catch {
    return value;
  }
}

function safeRenderText(candidate, fallback = '') {
  const fixed = repairMojibake(candidate);
  return countMojibakeNoise(fixed) > 0 ? fallback : fixed;
}

function sanitizeSavedTranslations(raw = {}) {
  const cleaned = {};
  for (const [k, v] of Object.entries(raw || {})) {
    if (typeof v !== 'string') continue;
    const fixed = repairMojibake(v);
    if (countMojibakeNoise(fixed) === 0) cleaned[k] = fixed;
  }
  return cleaned;
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('cityspark_lang') || 'en');
  
  const [translations, setTranslations] = useState(() => {
    const saved = localStorage.getItem(`cityspark_trans_${TRANSLATION_CACHE_VERSION}_${language}`);
    if (!saved) return {};
    try {
      return sanitizeSavedTranslations(JSON.parse(saved));
    } catch {
      return {};
    }
  });
  
  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const loadingKeysRef = useRef(new Set());
  const currentLanguageRef = useRef(language);

  useEffect(() => {
    currentLanguageRef.current = language;
    localStorage.setItem('cityspark_lang', language);
    const saved = localStorage.getItem(`cityspark_trans_${TRANSLATION_CACHE_VERSION}_${language}`);
    let next = {};
    if (saved) {
      try {
        next = sanitizeSavedTranslations(JSON.parse(saved));
      } catch {
        next = {};
      }
    }
    setTranslations(next);
    localStorage.setItem(`cityspark_trans_${TRANSLATION_CACHE_VERSION}_${language}`, JSON.stringify(next));
    queueRef.current = [];
    loadingKeysRef.current.clear();
  }, [language]);

  const processQueue = useCallback(async (targetLang) => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    
    while (queueRef.current.length > 0) {
      if (currentLanguageRef.current !== targetLang) break;
      const key = queueRef.current.shift();
      loadingKeysRef.current.add(key);

      try {
        console.log(`[LanguageContext] Translating: "${key}" to ${targetLang}`);
        let result = await translateText(key, targetLang);
        
        const containsDevanagari = /[\u0900-\u097F]/.test(result);
        const needsScriptGuard = (targetLang === 'pa' || targetLang === 'bn') && containsDevanagari;
        const isFailure = !result || result === key;

        if (needsScriptGuard || isFailure) {
          console.warn(`[LanguageContext] Sarvam failure detected for "${key}". Falling back to Gemini...`);
          const fallback = await translateWithGemini(key, targetLang);
          if (fallback) result = fallback;
        }

        if (currentLanguageRef.current === targetLang && result && result !== key) {
          setTranslations(prev => {
            if (currentLanguageRef.current !== targetLang) return prev;
            const safeResult = safeRenderText(result, '');
            if (!safeResult) return prev;
            const updated = { ...prev, [key]: safeResult };
            localStorage.setItem(`cityspark_trans_${TRANSLATION_CACHE_VERSION}_${targetLang}`, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error(`[LanguageContext] Translation fail for: ${key}`, err);
        const fallback = await translateWithGemini(key, targetLang);
        if (fallback && currentLanguageRef.current === targetLang) {
          setTranslations(prev => {
            const safeFallback = safeRenderText(fallback, '');
            if (!safeFallback) return prev;
            const updated = { ...prev, [key]: safeFallback };
            localStorage.setItem(`cityspark_trans_${TRANSLATION_CACHE_VERSION}_${targetLang}`, JSON.stringify(updated));
            return updated;
          });
        }
      } finally {
        loadingKeysRef.current.delete(key);
      }
      await new Promise(resolve => setTimeout(resolve, SLEEP_MS));
    }
    
    isProcessingRef.current = false;
    if (queueRef.current.length > 0 && currentLanguageRef.current === targetLang) {
      processQueue(targetLang);
    }
  }, []);

  const t = useCallback((text) => {
    if (!text) return '';
    if (language === 'en') return safeRenderText(STATIC_EN[text] || text, STATIC_EN[text] || text);

    const staticDictionary = DICTIONARIES[language] || null;
    
    const sourceText = safeRenderText(STATIC_EN[text] || text, STATIC_EN[text] || text);

    // Prefer static dictionary entries when valid, but fall through to
    // async translation for missing/corrupted entries.
    if (staticDictionary?.[text]) {
      const staticValue = safeRenderText(staticDictionary[text], '');
      if (staticValue) return staticValue;
    }

    if (translations[text]) return safeRenderText(translations[text], sourceText);

    if (/^[0-9%.,\s$+-]+$/.test(sourceText)) return sourceText;

    if (sourceText.length > 80 && /[.!?]/.test(sourceText)) {
      const sentences = sourceText.match(/[^.!?]+[.!?]*\s*/g) || [sourceText];
      if (sentences.length > 1) {
        let allTranslated = true;
        const translatedSentences = sentences.map(s => {
          const trimmed = s.trim();
          if (!trimmed) return s;
          if (translations[trimmed]) return s.replace(trimmed, translations[trimmed]);
          allTranslated = false;
          if (!loadingKeysRef.current.has(trimmed) && !queueRef.current.includes(trimmed)) {
            loadingKeysRef.current.add(trimmed);
            queueRef.current.push(trimmed);
            setTimeout(() => processQueue(language), 0);
          }
          return s;
        });
        if (allTranslated) {
          const joined = safeRenderText(translatedSentences.join(''), sourceText);
          if (!translations[text]) {
            setTimeout(() => {
              setTranslations(prev => ({ ...prev, [text]: joined }));
            }, 0);
          }
          return joined;
        }
        return sourceText;
      }
    }

    if (!loadingKeysRef.current.has(text) && !queueRef.current.includes(text)) {
      loadingKeysRef.current.add(text);
      queueRef.current.push(text);
      setTimeout(() => processQueue(language), 0);
    }
    
    return sourceText;
  }, [language, translations, processQueue]);

  const value = useMemo(() => ({
    language,
    changeLanguage: setLanguage,
    t,
    languages: UI_LANGUAGES
  }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
