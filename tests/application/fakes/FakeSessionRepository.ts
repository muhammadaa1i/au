import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Message } from "@/domain/entities/Message";
import { Scenario } from "@/domain/entities/Scenario";
import { SessionRepository, SessionSummary, SessionWithContext } from "@/domain/ports/SessionRepository";
import { Score } from "@/domain/value-objects/Score";
import { LearnerProfileId, SessionId } from "@/domain/value-objects/ids";

export class FakeSessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, ConversationSession>();
  private readonly scenariosBySession = new Map<string, Scenario>();
  private readonly messages = new Map<string, Message[]>();
  private readonly userIdByClerkUserId = new Map<string, LearnerProfileId>();

  async save(session: ConversationSession): Promise<void> {
    this.sessions.set(session.id.toString(), session);
  }

  async findById(id: SessionId): Promise<ConversationSession | null> {
    return this.sessions.get(id.toString()) ?? null;
  }

  async findByIdWithContext(id: SessionId): Promise<SessionWithContext | null> {
    const session = this.sessions.get(id.toString());
    const scenario = this.scenariosBySession.get(id.toString());
    if (!session || !scenario) return null;
    return { session, scenario, messages: this.messages.get(id.toString()) ?? [] };
  }

  async findSummariesByUser(clerkUserId: string): Promise<SessionSummary[]> {
    const userId = this.userIdByClerkUserId.get(clerkUserId);
    if (!userId) return [];

    return [...this.sessions.values()]
      .filter((session) => session.userId.equals(userId))
      .map((session) => {
        const scenario = this.scenariosBySession.get(session.id.toString())!;
        const messages = this.messages.get(session.id.toString()) ?? [];
        const scores = messages
          .filter((message) => message.feedback !== null)
          .map((message) => message.feedback!.overallScore);
        return {
          session,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          averageScore: Score.average(scores),
          messageCount: messages.length,
        };
      });
  }

  async addMessage(message: Message): Promise<void> {
    const key = message.sessionId.toString();
    const existing = this.messages.get(key) ?? [];
    this.messages.set(key, [...existing, message]);
  }

  /** Test helper: associate a scenario with a session so findByIdWithContext/findSummariesByUser can resolve it. */
  linkScenario(sessionId: SessionId, scenario: Scenario): void {
    this.scenariosBySession.set(sessionId.toString(), scenario);
  }

  /** Test helper: mirrors the Prisma join findSummariesByUser relies on to resolve clerkUserId -> internal id. */
  linkClerkUser(clerkUserId: string, userId: LearnerProfileId): void {
    this.userIdByClerkUserId.set(clerkUserId, userId);
  }
}
