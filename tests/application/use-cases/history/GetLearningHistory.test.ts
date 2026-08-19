import { describe, expect, it } from "vitest";
import { GetLearningHistory } from "@/application/use-cases/history/GetLearningHistory";
import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Message } from "@/domain/entities/Message";
import { Scenario } from "@/domain/entities/Scenario";
import { LanguageFeedback } from "@/domain/value-objects/LanguageFeedback";
import { Score } from "@/domain/value-objects/Score";
import { LearnerProfileId, MessageId, ScenarioId, SessionId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { FakeSessionRepository } from "../../fakes/FakeSessionRepository";

function buildScenario(id: string) {
  return Scenario.create({
    id: ScenarioId.of(id),
    createdById: LearnerProfileId.of("teacher-1"),
    title: `Scenario ${id}`,
    description: "desc",
    category: "shopping",
    jlptLevel: JlptLevel.of("N5"),
    systemPrompt: "prompt",
    openingLine: "いらっしゃいませ",
  });
}

describe("GetLearningHistory", () => {
  it("returns sessions with their average score, newest first", async () => {
    const repo = new FakeSessionRepository();
    const userId = LearnerProfileId.of("learner-1");

    const older = ConversationSession.start({ id: SessionId.of("s1"), userId, scenarioId: ScenarioId.of("sc1") });
    repo.linkScenario(older.id, buildScenario("sc1"));
    await repo.save(older);
    await repo.addMessage(
      (() => {
        const m = Message.learnerUtterance({
          id: MessageId.of("m1"),
          sessionId: older.id,
          text: "こんにちは",
          recognitionConfidence: 0.9,
        });
        m.attachFeedback(LanguageFeedback.create({ overallScore: Score.of(60), grammarNotes: [], naturalnessNotes: [] }));
        return m;
      })(),
    );

    await new Promise((resolve) => setTimeout(resolve, 5));

    const newer = ConversationSession.start({ id: SessionId.of("s2"), userId, scenarioId: ScenarioId.of("sc2") });
    repo.linkScenario(newer.id, buildScenario("sc2"));
    await repo.save(newer);

    const history = await new GetLearningHistory(repo).execute("learner-1");

    expect(history.map((entry) => entry.session.id.toString())).toEqual(["s2", "s1"]);
    expect(history[1].averageScore.valueOf()).toBe(60);
    expect(history[0].averageScore.valueOf()).toBe(0);
  });

  it("only returns sessions belonging to the requested user", async () => {
    const repo = new FakeSessionRepository();
    const mine = ConversationSession.start({
      id: SessionId.of("mine"),
      userId: LearnerProfileId.of("learner-1"),
      scenarioId: ScenarioId.of("sc1"),
    });
    const theirs = ConversationSession.start({
      id: SessionId.of("theirs"),
      userId: LearnerProfileId.of("learner-2"),
      scenarioId: ScenarioId.of("sc1"),
    });
    repo.linkScenario(mine.id, buildScenario("sc1"));
    repo.linkScenario(theirs.id, buildScenario("sc1"));
    await repo.save(mine);
    await repo.save(theirs);

    const history = await new GetLearningHistory(repo).execute("learner-1");

    expect(history.map((entry) => entry.session.id.toString())).toEqual(["mine"]);
  });
});
