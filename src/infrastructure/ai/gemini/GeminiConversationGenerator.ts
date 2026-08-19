import type { Content, GoogleGenAI } from "@google/genai";
import {
  ConversationGenerator,
  ConversationTurnInput,
  ConversationTurnOutput,
} from "@/domain/ports/ConversationGenerator";
import { geminiClient, GEMINI_MODEL } from "@/infrastructure/ai/gemini/gemini-client";

export class GeminiConversationGenerator implements ConversationGenerator {
  constructor(
    private readonly client: GoogleGenAI = geminiClient,
    private readonly model: string = GEMINI_MODEL,
  ) {}

  async generateReply(input: ConversationTurnInput): Promise<ConversationTurnOutput> {
    const contents: Content[] = input.history.map((turn) => ({
      role: turn.role === "learner" ? "user" : "model",
      parts: [{ text: turn.text }],
    }));

    const start = Date.now();
    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
      config: { systemInstruction: buildSystemInstruction(input) },
    });
    console.log(`[timing] GeminiConversationGenerator.generateReply took ${Date.now() - start}ms`);

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Gemini returned an empty conversation reply");
    }
    return { text };
  }
}

function buildSystemInstruction(input: ConversationTurnInput): string {
  return [
    "You are role-playing a Japanese conversation partner for a language learner practicing spoken Japanese.",
    `Scenario: ${input.scenario.title} — ${input.scenario.description}`,
    `Your persona and behavior: ${input.scenario.systemPrompt}`,
    `The learner's JLPT level is ${input.learnerLevel.toString()}. Keep your vocabulary, grammar and sentence length appropriate for that level.`,
    "Reply only in natural, conversational Japanese as your character would speak — a single short turn, no explanations, no translations, no romaji.",
  ].join("\n");
}
