import { ConversationTurn } from "@/domain/ports/ConversationGenerator";
import { Scenario } from "@/domain/entities/Scenario";
import { LanguageFeedback } from "@/domain/value-objects/LanguageFeedback";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";

export interface SpeechFeedbackInput {
  scenario: Scenario;
  learnerLevel: JlptLevel;
  conversationSoFar: ConversationTurn[];
  learnerUtterance: string;
  /** Confidence (0-1) reported by the browser's speech recognizer for this utterance. */
  recognitionConfidence: number;
}

/**
 * Produces language feedback for a learner's spoken utterance.
 *
 * Note: with the free Web Speech API pipeline (see project plan), this is not
 * phoneme-level pronunciation analysis — it combines the recognizer's
 * confidence score with an LLM's judgment of grammar/naturalness of the
 * recognized text. Swapping to a phonetic assessment service later only
 * requires a new adapter behind this port.
 */
export interface SpeechFeedbackEvaluator {
  evaluate(input: SpeechFeedbackInput): Promise<LanguageFeedback>;
}
