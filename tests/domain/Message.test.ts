import { describe, expect, it } from "vitest";
import { Message } from "@/domain/entities/Message";
import { EmptyMessageTextError, FeedbackNotAllowedForTutorMessageError } from "@/domain/errors/DomainError";
import { LanguageFeedback } from "@/domain/value-objects/LanguageFeedback";
import { Score } from "@/domain/value-objects/Score";
import { MessageId, SessionId } from "@/domain/value-objects/ids";

const sessionId = SessionId.of("session-1");

describe("Message", () => {
  it("creates a learner utterance with recognition confidence and no feedback yet", () => {
    const message = Message.learnerUtterance({
      id: MessageId.of("msg-1"),
      sessionId,
      text: "こんにちは",
      recognitionConfidence: 0.87,
    });
    expect(message.role).toBe("learner");
    expect(message.recognitionConfidence).toBe(0.87);
    expect(message.feedback).toBeNull();
  });

  it("creates a tutor reply with no recognition confidence", () => {
    const message = Message.tutorReply({
      id: MessageId.of("msg-2"),
      sessionId,
      text: "いらっしゃいませ！",
    });
    expect(message.role).toBe("tutor");
    expect(message.recognitionConfidence).toBeNull();
  });

  it("rejects blank text for either role", () => {
    expect(() =>
      Message.learnerUtterance({ id: MessageId.of("m"), sessionId, text: "  ", recognitionConfidence: 1 }),
    ).toThrow(EmptyMessageTextError);
    expect(() => Message.tutorReply({ id: MessageId.of("m"), sessionId, text: "" })).toThrow(
      EmptyMessageTextError,
    );
  });

  it("allows attaching feedback to a learner message", () => {
    const message = Message.learnerUtterance({
      id: MessageId.of("msg-1"),
      sessionId,
      text: "こんにちは",
      recognitionConfidence: 0.87,
    });
    const feedback = LanguageFeedback.create({
      overallScore: Score.of(75),
      grammarNotes: [],
      naturalnessNotes: [],
    });
    message.attachFeedback(feedback);
    expect(message.feedback).toBe(feedback);
  });

  it("refuses to attach feedback to a tutor message", () => {
    const message = Message.tutorReply({ id: MessageId.of("msg-2"), sessionId, text: "はい" });
    const feedback = LanguageFeedback.create({
      overallScore: Score.of(75),
      grammarNotes: [],
      naturalnessNotes: [],
    });
    expect(() => message.attachFeedback(feedback)).toThrow(FeedbackNotAllowedForTutorMessageError);
  });
});
