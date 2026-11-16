import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// A "-latest" alias keeps the app working as Google retires specific model versions.
// Flash-Lite is used for latency: the full Flash model's default reasoning made
// summaries take over a minute. Override with GEMINI_MODEL if needed.
const model = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

export const ai = genkit({
  plugins: [googleAI()],
  model: `googleai/${model}`,
});
