import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';

if (!apiKey) {
  console.error('Missing GEMINI_API_KEY. Set it in your shell before running this script.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

try {
  const response = await ai.models.generateContent({
    model,
    contents: 'Give me a fun activity to do this weekend in one sentence.',
  });

  console.log(response.text);
} catch (error) {
  console.error(`Gemini request failed for model ${model}.`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}