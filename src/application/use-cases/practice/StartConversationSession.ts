import { NotFoundError } from "@/application/errors/ApplicationError";
import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Message } from "@/domain/entities/Message";
import { Scenario } from "@/domain/entities/Scenario";
import { IdGenerator } from "@/domain/ports/IdGenerator";
import { ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { SessionRepository } from "@/domain/ports/SessionRepository";
import { LearnerProfileId, MessageId, ScenarioId, SessionId } from "@/domain/value-objects/ids";

export interface StartConversationSessionInput {
  userId: string;
  scenarioId: string;
}

export interface StartConversationSessionOutput {
  session: ConversationSession;
  scenario: Scenario;
  openingMessage: Message;
}

export class StartConversationSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly scenarios: ScenarioRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: StartConversationSessionInput): Promise<StartConversationSessionOutput> {
    const scenario = await this.scenarios.findById(ScenarioId.of(input.scenarioId));
    if (!scenario || !scenario.isPublished) {
      throw new NotFoundError(`Scenario "${input.scenarioId}" not found`);
    }

    const session = ConversationSession.start({
      id: SessionId.of(this.ids.generate()),
      userId: LearnerProfileId.of(input.userId),
      scenarioId: scenario.id,
    });
    await this.sessions.save(session);

    const openingMessage = Message.tutorReply({
      id: MessageId.of(this.ids.generate()),
      sessionId: session.id,
      text: scenario.openingLine,
    });
    await this.sessions.addMessage(openingMessage);

    return { session, scenario, openingMessage };
  }
}
