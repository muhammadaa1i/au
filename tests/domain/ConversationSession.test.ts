import { describe, expect, it } from "vitest";
import { ConversationSession } from "@/domain/entities/ConversationSession";
import { SessionAlreadyCompletedError } from "@/domain/errors/DomainError";
import { LearnerProfileId, ScenarioId, SessionId } from "@/domain/value-objects/ids";

function startSession() {
  return ConversationSession.start({
    id: SessionId.of("session-1"),
    userId: LearnerProfileId.of("learner-1"),
    scenarioId: ScenarioId.of("scenario-1"),
  });
}

describe("ConversationSession", () => {
  it("starts as active with no end date", () => {
    const session = startSession();
    expect(session.status).toBe("active");
    expect(session.isActive).toBe(true);
    expect(session.endedAt).toBeNull();
  });

  it("becomes completed with an end date when completed", () => {
    const session = startSession();
    session.complete();
    expect(session.status).toBe("completed");
    expect(session.isActive).toBe(false);
    expect(session.endedAt).toBeInstanceOf(Date);
  });

  it("cannot be completed twice", () => {
    const session = startSession();
    session.complete();
    expect(() => session.complete()).toThrow(SessionAlreadyCompletedError);
  });
});
