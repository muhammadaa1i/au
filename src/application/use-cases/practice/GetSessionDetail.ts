import { NotFoundError } from "@/application/errors/ApplicationError";
import { SessionRepository, SessionWithContext } from "@/domain/ports/SessionRepository";
import { SessionId } from "@/domain/value-objects/ids";

export class GetSessionDetail {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(sessionId: string, userId: string): Promise<SessionWithContext> {
    const context = await this.sessions.findByIdWithContext(SessionId.of(sessionId));
    if (!context || context.session.userId.toString() !== userId) {
      throw new NotFoundError(`Conversation session "${sessionId}" not found`);
    }
    return context;
  }
}
