/**
 * Gemini AI Translation Service (Fallback)
 */

const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-pro"];

/**
 * Translates text using Gemini AI as a high-quality fallback
 */
export const translateWithGemini = async (text, targetLang, sourceLang = 'en') => {
  if (!GEMINI_API_KEY) return null;

  const langNames = {
    hi: 'Hindi (Devanagari script)',
    bn: 'Bengali (Bengali script)',
    te: 'Telugu',
    mr: 'Marathi (Devanagari script)',
    ta: 'Tamil',
    gu: 'Gujarati',
    kn: 'Kannada',
    ml: 'Malayalam',
    pa: 'Punjabi (Gurmukhi script ONLY, strictly no Devanagari)'
  };

  const targetLangName = langNames[targetLang] || targetLang;

  const prompt = `Translate the following text from ${sourceLang} to ${targetLangName}. 
Output ONLY the translated text, no explanations, no quotes. 
If translating to Punjabi, ensure you use ONLY Gurmukhi script.
Text to translate: ${text}`;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      });

      if (!response.ok) continue;

      const json = await response.json();
      const translated = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (translated) return translated;
    } catch (error) {
      console.error(`Gemini Error (${model}):`, error);
      continue;
    }
  }

  return null;
};
