/**
 * Sarvam AI Translation Service
 */

const SARVAM_API_KEY = import.meta.env?.VITE_SARVAM_API_KEY || '';
const BASE_URL = 'https://api.sarvam.ai/translate';

/**
 * Maps standard ISO language codes to Sarvam specific codes (e.g. 'hi' -> 'hi-IN')
 */
const mapLanguageCode = (code) => {
  if (code === 'en') return 'en-IN';
  return `${code}-IN`;
};

/**
 * Translates text using Sarvam AI API
 */
export const translateText = async (text, targetLang, sourceLang = 'en') => {
  if (!SARVAM_API_KEY) {
    console.warn('Sarvam API Key missing.');
    return text;
  }

  // NOTE: We no longer support batching by joining strings, as it was unreliable 
  // with the Sarvam NMT model (caused 400 errors and merged segments).
  // Batching is now handled via a sequential queue in LanguageContext.jsx.

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        input: text,
        source_language_code: mapLanguageCode(sourceLang),
        target_language_code: mapLanguageCode(targetLang),
        speaker_gender: 'Male',
        mode: 'formal'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Sarvam API Error:', errorData);
      return text;
    }

    const data = await response.json();
    return data.translated_text || text;
  } catch (error) {
    console.error('Sarvam Translation Service Error:', error);
    return text;
  }
};
