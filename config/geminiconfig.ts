import env from "#start/env";
import { GoogleGenAI } from "@google/genai";

export const geminiai = new GoogleGenAI({
  apiKey: env.get('GEMINI_API_KEY'),
});
