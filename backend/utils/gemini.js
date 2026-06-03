// Thin wrapper around the Gemini API. All agents use gemini-2.0-flash.
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getModel = (opts = {}) =>
  genAI.getGenerativeModel({ model: 'gemini-2.0-flash', ...opts });

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
