import { Type, type GoogleGenAI, type Schema } from "@google/genai";
import { SpeechFeedbackEvaluator, SpeechFeedbackInput } from "@/domain/ports/SpeechFeedbackEvaluator";
import { LanguageFeedback } from "@/domain/value-objects/LanguageFeedback";
import { Score } from "@/domain/value-objects/Score";
import { geminiClient, GEMINI_MODEL } from "@/infrastructure/ai/gemini/gemini-client";

interface FeedbackJson {
  overallScore: number;
  grammarNotes: string[];
  naturalnessNotes: string[];
  suggestedCorrection?: string;
}

const feedbackResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, minimum: 0, maximum: 100 },
    grammarNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
    naturalnessNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedCorrection: { type: Type.STRING },
  },
  required: ["overallScore", "grammarNotes", "naturalnessNotes"],
};

export class GeminiSpeechFeedbackEvaluator implements SpeechFeedbackEvaluator {
  constructor(
    private readonly client: GoogleGenAI = geminiClient,
    private readonly model: string = GEMINI_MODEL,
  ) {}

  async evaluate(input: SpeechFeedbackInput): Promise<LanguageFeedback> {
    const start = Date.now();
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: buildPrompt(input),
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackResponseSchema,
      },
    });
    console.log(`[timing] GeminiSpeechFeedbackEvaluator.evaluate took ${Date.now() - start}ms`);

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty feedback response");
    }
    const parsed = JSON.parse(text) as FeedbackJson;

    return LanguageFeedback.create({
      overallScore: Score.of(Math.round(parsed.overallScore)),
      grammarNotes: parsed.grammarNotes,
      naturalnessNotes: parsed.naturalnessNotes,
      suggestedCorrection: parsed.suggestedCorrection || undefined,
    });
  }
}

function buildPrompt(input: SpeechFeedbackInput): string {
  const recentHistory = input.conversationSoFar
    .slice(-6)
    .map((turn) => `${turn.role === "learner" ? "Learner" : "Tutor"}: ${turn.text}`)
    .join("\n");

  return [
    "You are a Japanese language tutor grading a learner's spoken turn in a roleplay conversation.",
    `Scenario: ${input.scenario.title} — ${input.scenario.description}`,
    `Learner's JLPT level: ${input.learnerLevel.toString()}.`,
    `Conversation so far:\n${recentHistory || "(this is the learner's first turn)"}`,
    `The learner's speech was transcribed by the browser's speech recognizer with confidence ${(
      input.recognitionConfidence * 100
    ).toFixed(0)}%: "${input.learnerUtterance}"`,
    "Note: you only have the recognized text and recognition confidence, not the actual audio, so you cannot judge phonetic pronunciation directly. Factor the recognizer's confidence into the score as a proxy for how clearly the learner likely spoke, and otherwise judge the grammar and naturalness of the recognized text for the learner's level.",
    "Respond with JSON: overallScore (0-100 integer), grammarNotes (short strings, empty array if none), naturalnessNotes (short strings, empty array if none), suggestedCorrection (a corrected, more natural version of the learner's sentence — omit if it was already good). Write all notes in Uzbek, addressed directly to the learner.",
  ].join("\n\n");
}
