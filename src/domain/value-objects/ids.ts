import { EntityId } from "@/domain/value-objects/EntityId";

export class LearnerProfileId extends EntityId {
  static of(value: string): LearnerProfileId {
    return new LearnerProfileId(value);
  }
}

export class ScenarioId extends EntityId {
  static of(value: string): ScenarioId {
    return new ScenarioId(value);
  }
}

export class SessionId extends EntityId {
  static of(value: string): SessionId {
    return new SessionId(value);
  }
}

export class MessageId extends EntityId {
  static of(value: string): MessageId {
    return new MessageId(value);
  }
}
