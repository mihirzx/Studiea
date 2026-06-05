// Thin wrapper around the Gemini API. All agents use gemini-2.0-flash.
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Default model is overridable via GEMINI_MODEL. The bible targets "Gemini Flash";
// gemini-2.0-flash was retired, so the current stable Flash is gemini-2.5-flash.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export const getModel = (opts = {}) =>
  genAI.getGenerativeModel({ model: MODEL, ...opts });

// Generate and parse a JSON response. Throws if the model returns non-JSON.
export const generateJSON = async (prompt, opts = {}) => {
  const model = getModel({
    generationConfig: { responseMimeType: 'application/json' },
    ...opts
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Gemini did not return valid JSON');
  }
};

// Generate a plain-text response (e.g. Study Buddy chat).
export const generateText = async (prompt, opts = {}) => {
  const model = getModel(opts);
  const result = await model.generateContent(prompt);
  return result.response.text();
};
