import { NotFoundError } from "@/application/errors/ApplicationError";
import { ConversationSession } from "@/domain/entities/ConversationSession";
import { SessionRepository } from "@/domain/ports/SessionRepository";
import { Score } from "@/domain/value-objects/Score";
import { SessionId } from "@/domain/value-objects/ids";

export interface EndConversationSessionOutput {
  session: ConversationSession;
  averageScore: Score;
}

export class EndConversationSession {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(sessionId: string, userId: string): Promise<EndConversationSessionOutput> {
    const context = await this.sessions.findByIdWithContext(SessionId.of(sessionId));
    if (!context || context.session.userId.toString() !== userId) {
      throw new NotFoundError(`Conversation session "${sessionId}" not found`);
    }

    const { session, messages } = context;
    session.complete();
    await this.sessions.save(session);

    const scores = messages
      .filter((message) => message.feedback !== null)
      .map((message) => message.feedback!.overallScore);

    return { session, averageScore: Score.average(scores) };
  }
}
