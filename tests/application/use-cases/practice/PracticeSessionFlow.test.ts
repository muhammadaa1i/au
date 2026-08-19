import { beforeEach, describe, expect, it } from "vitest";
import { StartConversationSession } from "@/application/use-cases/practice/StartConversationSession";
import { SendUserMessage } from "@/application/use-cases/practice/SendUserMessage";
import { EndConversationSession } from "@/application/use-cases/practice/EndConversationSession";
import { NotFoundError, SessionNotActiveError } from "@/application/errors/ApplicationError";
import { LearnerProfile } from "@/domain/entities/LearnerProfile";
import { Scenario } from "@/domain/entities/Scenario";
import { LearnerProfileId, ScenarioId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { FakeScenarioRepository } from "../../fakes/FakeScenarioRepository";
import { FakeSessionRepository } from "../../fakes/FakeSessionRepository";
import { FakeUserProfileRepository } from "../../fakes/FakeUserProfileRepository";
import { FakeIdGenerator } from "../../fakes/FakeIdGenerator";
import { FakeConversationGenerator } from "../../fakes/FakeConversationGenerator";
import { FakeSpeechFeedbackEvaluator } from "../../fakes/FakeSpeechFeedbackEvaluator";

function buildPublishedScenario() {
  const scenario = Scenario.create({
    id: ScenarioId.of("scenario-1"),
    createdById: LearnerProfileId.of("teacher-1"),
    title: "Konbinida xarid",
    description: "Buy items at a convenience store.",
    category: "shopping",
    jlptLevel: JlptLevel.of("N5"),
    systemPrompt: "You are a konbini clerk.",
    openingLine: "いらっしゃいませ！",
  });
  scenario.publish();
  return scenario;
}

function buildLearner(id = "learner-1", clerkUserId = "clerk_1") {
  return LearnerProfile.createDefault({
    id: LearnerProfileId.of(id),
    clerkUserId,
    displayName: "Aziz",
  });
}

describe("Practice session flow", () => {
  let scenarioRepo: FakeScenarioRepository;
  let sessionRepo: FakeSessionRepository;
  let profileRepo: FakeUserProfileRepository;
  let ids: FakeIdGenerator;
  let conversationGenerator: FakeConversationGenerator;
  let feedbackEvaluator: FakeSpeechFeedbackEvaluator;

  beforeEach(() => {
    scenarioRepo = new FakeScenarioRepository();
    sessionRepo = new FakeSessionRepository();
    profileRepo = new FakeUserProfileRepository();
    ids = new FakeIdGenerator();
    conversationGenerator = new FakeConversationGenerator();
    feedbackEvaluator = new FakeSpeechFeedbackEvaluator();

    scenarioRepo.seed(buildPublishedScenario());
    profileRepo.seed(buildLearner());
  });

  async function startSession() {
    const useCase = new StartConversationSession(sessionRepo, scenarioRepo, ids);
    const result = await useCase.execute({ userId: "learner-1", scenarioId: "scenario-1" });
    sessionRepo.linkScenario(result.session.id, result.scenario);
    return result;
  }

  function buildSendMessage() {
    return new SendUserMessage(sessionRepo, profileRepo, ids, conversationGenerator, feedbackEvaluator);
  }

  it("starts a session and records the scenario's opening line as the first tutor message", async () => {
    const { session, openingMessage } = await startSession();

    expect(session.isActive).toBe(true);
    expect(openingMessage.role).toBe("tutor");
    expect(openingMessage.text).toBe("いらっしゃいませ！");

    const context = await sessionRepo.findByIdWithContext(session.id);
    expect(context?.messages).toHaveLength(1);
  });

  it("refuses to start a session for an unpublished or missing scenario", async () => {
    const useCase = new StartConversationSession(sessionRepo, scenarioRepo, ids);
    await expect(useCase.execute({ userId: "learner-1", scenarioId: "does-not-exist" })).rejects.toThrow(
      NotFoundError,
    );
  });

  it("records the learner's message with feedback and the tutor's generated reply", async () => {
    const { session } = await startSession();

    const { learnerMessage, tutorMessage } = await buildSendMessage().execute({
      sessionId: session.id.toString(),
      userId: "learner-1",
      learnerUtterance: "パンをください",
      recognitionConfidence: 0.91,
    });

    expect(learnerMessage.role).toBe("learner");
    expect(learnerMessage.feedback?.overallScore.valueOf()).toBe(80);
    expect(tutorMessage.role).toBe("tutor");
    expect(tutorMessage.text).toBe("かしこまりました。");

    const context = await sessionRepo.findByIdWithContext(session.id);
    expect(context?.messages).toHaveLength(3);
    expect(feedbackEvaluator.lastInput?.learnerUtterance).toBe("パンをください");
    expect(conversationGenerator.lastInput?.history.at(-1)).toEqual({
      role: "learner",
      text: "パンをください",
    });
  });

  it("refuses to send a message to an already-completed session", async () => {
    const { session } = await startSession();
    await new EndConversationSession(sessionRepo).execute(session.id.toString(), "learner-1");

    await expect(
      buildSendMessage().execute({
        sessionId: session.id.toString(),
        userId: "learner-1",
        learnerUtterance: "こんにちは",
        recognitionConfidence: 0.9,
      }),
    ).rejects.toThrow(SessionNotActiveError);
  });

  it("computes the average score across learner messages when ending a session", async () => {
    const { session } = await startSession();

    await buildSendMessage().execute({
      sessionId: session.id.toString(),
      userId: "learner-1",
      learnerUtterance: "パンをください",
      recognitionConfidence: 0.9,
    });

    const { session: ended, averageScore } = await new EndConversationSession(sessionRepo).execute(
      session.id.toString(),
      "learner-1",
    );

    expect(ended.isActive).toBe(false);
    expect(averageScore.valueOf()).toBe(80);
  });

  it("refuses to send a message to another learner's session", async () => {
    const { session } = await startSession();
    profileRepo.seed(buildLearner("learner-2", "clerk_2"));

    await expect(
      buildSendMessage().execute({
        sessionId: session.id.toString(),
        userId: "learner-2",
        learnerUtterance: "こんにちは",
        recognitionConfidence: 0.9,
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("refuses to end another learner's session", async () => {
    const { session } = await startSession();

    await expect(
      new EndConversationSession(sessionRepo).execute(session.id.toString(), "learner-2"),
    ).rejects.toThrow(NotFoundError);
  });
});
