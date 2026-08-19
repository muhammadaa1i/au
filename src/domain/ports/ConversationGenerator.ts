import { MessageRoleValue } from "@/domain/entities/Message";
import { Scenario } from "@/domain/entities/Scenario";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";

export interface ConversationTurn {
  role: MessageRoleValue;
  text: string;
}

export interface ConversationTurnInput {
  scenario: Scenario;
  learnerLevel: JlptLevel;
  history: ConversationTurn[];
}

export interface ConversationTurnOutput {
  text: string;
}

/**
 * Generates the tutor's next line in a practice conversation.
 * Implementations call an LLM (see infrastructure/ai) — this port keeps the
 * application/domain layers free of any specific AI vendor.
 */
export interface ConversationGenerator {
  generateReply(input: ConversationTurnInput): Promise<ConversationTurnOutput>;
}
