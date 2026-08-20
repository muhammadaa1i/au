import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Message } from "@/domain/entities/Message";
import { Scenario } from "@/domain/entities/Scenario";
import { Score } from "@/domain/value-objects/Score";
import { ScenarioId, SessionId } from "@/domain/value-objects/ids";

export interface SessionWithContext {
  session: ConversationSession;
  scenario: Scenario;
  messages: Message[];
}

/**
 * Lean projection for list views (history, dashboard) — deliberately excludes
 * full message text and unused scenario fields (e.g. systemPrompt), which
 * findByIdWithContext fetches for the live chat view but a summary list never
 * needs. See PrismaSessionRepository.findSummariesByUser.
 */
export interface SessionSummary {
  session: ConversationSession;
  scenarioId: ScenarioId;
  scenarioTitle: string;
  averageScore: Score;
  messageCount: number;
}

export interface SessionRepository {
  save(session: ConversationSession): Promise<void>;
  findById(id: SessionId): Promise<ConversationSession | null>;
  findByIdWithContext(id: SessionId): Promise<SessionWithContext | null>;
  /**
   * Takes the Clerk user ID directly (not the internal LearnerProfileId) so
   * callers can query session summaries without first resolving the
   * LearnerProfile row — letting that resolution (needed for other page
   * content, e.g. the display name) run in parallel with this query instead
   * of blocking it. The implementation joins through to the profile by
   * clerkUserId internally.
   */
  findSummariesByUser(clerkUserId: string): Promise<SessionSummary[]>;
  addMessage(message: Message): Promise<void>;
}
