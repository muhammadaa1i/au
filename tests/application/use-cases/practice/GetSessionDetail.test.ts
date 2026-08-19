import { describe, expect, it } from "vitest";
import { GetSessionDetail } from "@/application/use-cases/practice/GetSessionDetail";
import { NotFoundError } from "@/application/errors/ApplicationError";
import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Scenario } from "@/domain/entities/Scenario";
import { LearnerProfileId, ScenarioId, SessionId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { FakeSessionRepository } from "../../fakes/FakeSessionRepository";

describe("GetSessionDetail", () => {
  it("returns the session, scenario and messages for the owning user", async () => {
    const repo = new FakeSessionRepository();
    const session = ConversationSession.start({
      id: SessionId.of("s1"),
      userId: LearnerProfileId.of("learner-1"),
      scenarioId: ScenarioId.of("sc1"),
    });
    const scenario = Scenario.create({
      id: ScenarioId.of("sc1"),
      createdById: LearnerProfileId.of("teacher-1"),
      title: "Scenario",
      description: "desc",
      category: "shopping",
      jlptLevel: JlptLevel.of("N5"),
      systemPrompt: "prompt",
      openingLine: "いらっしゃいませ",
    });
    repo.linkScenario(session.id, scenario);
    await repo.save(session);

    const detail = await new GetSessionDetail(repo).execute("s1", "learner-1");

    expect(detail.session.id.toString()).toBe("s1");
    expect(detail.scenario.id.toString()).toBe("sc1");
  });

  it("throws NotFoundError for a session belonging to someone else", async () => {
    const repo = new FakeSessionRepository();
    const session = ConversationSession.start({
      id: SessionId.of("s1"),
      userId: LearnerProfileId.of("learner-1"),
      scenarioId: ScenarioId.of("sc1"),
    });
    repo.linkScenario(
      session.id,
      Scenario.create({
        id: ScenarioId.of("sc1"),
        createdById: LearnerProfileId.of("teacher-1"),
        title: "Scenario",
        description: "desc",
        category: "shopping",
        jlptLevel: JlptLevel.of("N5"),
        systemPrompt: "prompt",
        openingLine: "いらっしゃいませ",
      }),
    );
    await repo.save(session);

    await expect(new GetSessionDetail(repo).execute("s1", "learner-2")).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError for an unknown session", async () => {
    const repo = new FakeSessionRepository();
    await expect(new GetSessionDetail(repo).execute("missing", "learner-1")).rejects.toThrow(NotFoundError);
  });
});
