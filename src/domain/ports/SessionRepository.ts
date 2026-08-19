import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Message } from "@/domain/entities/Message";
import { Scenario } from "@/domain/entities/Scenario";
import { LearnerProfileId, SessionId } from "@/domain/value-objects/ids";

export interface SessionWithContext {
  session: ConversationSession;
  scenario: Scenario;
  messages: Message[];
}

export interface SessionRepository {
  save(session: ConversationSession): Promise<void>;
  findById(id: SessionId): Promise<ConversationSession | null>;
  findByIdWithContext(id: SessionId): Promise<SessionWithContext | null>;
  findByUser(userId: LearnerProfileId): Promise<SessionWithContext[]>;
  addMessage(message: Message): Promise<void>;
}
