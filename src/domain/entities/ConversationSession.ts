import { SessionAlreadyCompletedError } from "@/domain/errors/DomainError";
import { LearnerProfileId, ScenarioId, SessionId } from "@/domain/value-objects/ids";

export type SessionStatusValue = "active" | "completed";

export interface ConversationSessionProps {
  id: SessionId;
  userId: LearnerProfileId;
  scenarioId: ScenarioId;
  status: SessionStatusValue;
  startedAt: Date;
  endedAt: Date | null;
}

export class ConversationSession {
  private constructor(private props: ConversationSessionProps) {}

  static start(props: { id: SessionId; userId: LearnerProfileId; scenarioId: ScenarioId }): ConversationSession {
    return new ConversationSession({
      ...props,
      status: "active",
      startedAt: new Date(),
      endedAt: null,
    });
  }

  static reconstitute(props: ConversationSessionProps): ConversationSession {
    return new ConversationSession(props);
  }

  complete(): void {
    if (this.props.status === "completed") {
      throw new SessionAlreadyCompletedError(this.props.id.toString());
    }
    this.props.status = "completed";
    this.props.endedAt = new Date();
  }

  get id(): SessionId {
    return this.props.id;
  }

  get userId(): LearnerProfileId {
    return this.props.userId;
  }

  get scenarioId(): ScenarioId {
    return this.props.scenarioId;
  }

  get status(): SessionStatusValue {
    return this.props.status;
  }

  get isActive(): boolean {
    return this.props.status === "active";
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get endedAt(): Date | null {
    return this.props.endedAt;
  }
}
