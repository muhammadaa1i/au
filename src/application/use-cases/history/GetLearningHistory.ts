import { SessionRepository, SessionSummary } from "@/domain/ports/SessionRepository";

export class GetLearningHistory {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(clerkUserId: string): Promise<SessionSummary[]> {
    const summaries = await this.sessions.findSummariesByUser(clerkUserId);
    return [...summaries].sort((a, b) => b.session.startedAt.getTime() - a.session.startedAt.getTime());
  }
}
