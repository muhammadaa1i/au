import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Message } from "@/domain/entities/Message";
import { Scenario } from "@/domain/entities/Scenario";
import { SessionRepository, SessionWithContext } from "@/domain/ports/SessionRepository";
import { LearnerProfileId, SessionId } from "@/domain/value-objects/ids";

export class FakeSessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, ConversationSession>();
  private readonly scenariosBySession = new Map<string, Scenario>();
  private readonly messages = new Map<string, Message[]>();

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

  async findByUser(userId: LearnerProfileId): Promise<SessionWithContext[]> {
    return [...this.sessions.values()]
      .filter((session) => session.userId.equals(userId))
      .map((session) => ({
        session,
        scenario: this.scenariosBySession.get(session.id.toString())!,
        messages: this.messages.get(session.id.toString()) ?? [],
      }));
  }

  async addMessage(message: Message): Promise<void> {
    const key = message.sessionId.toString();
    const existing = this.messages.get(key) ?? [];
    this.messages.set(key, [...existing, message]);
  }

  /** Test helper: associate a scenario with a session so findByIdWithContext/findByUser can resolve it. */
  linkScenario(sessionId: SessionId, scenario: Scenario): void {
    this.scenariosBySession.set(sessionId.toString(), scenario);
  }
}
