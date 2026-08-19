import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Scenario } from "@/domain/entities/Scenario";
import { SessionRepository } from "@/domain/ports/SessionRepository";
import { Score } from "@/domain/value-objects/Score";
import { LearnerProfileId } from "@/domain/value-objects/ids";

export interface LearningHistoryEntry {
  session: ConversationSession;
  scenario: Scenario;
  averageScore: Score;
  messageCount: number;
}

export class GetLearningHistory {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(userId: string): Promise<LearningHistoryEntry[]> {
    const contexts = await this.sessions.findByUser(LearnerProfileId.of(userId));

    return contexts
      .map(({ session, scenario, messages }): LearningHistoryEntry => {
        const scores = messages
          .filter((message) => message.feedback !== null)
          .map((message) => message.feedback!.overallScore);
        return {
          session,
          scenario,
          averageScore: Score.average(scores),
          messageCount: messages.length,
        };
      })
      .sort((a, b) => b.session.startedAt.getTime() - a.session.startedAt.getTime());
  }
}
