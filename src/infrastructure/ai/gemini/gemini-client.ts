import { GoogleGenAI } from "@google/genai";
import { env } from "@/env";

export const geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/** Free-tier Gemini model. Override with GEMINI_MODEL if Google renames/retires this id. */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
