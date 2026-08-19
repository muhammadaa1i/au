import { NotFoundError, SessionNotActiveError } from "@/application/errors/ApplicationError";
import { Message } from "@/domain/entities/Message";
import { ConversationGenerator } from "@/domain/ports/ConversationGenerator";
import { IdGenerator } from "@/domain/ports/IdGenerator";
import { SessionRepository } from "@/domain/ports/SessionRepository";
import { SpeechFeedbackEvaluator } from "@/domain/ports/SpeechFeedbackEvaluator";
import { UserProfileRepository } from "@/domain/ports/UserProfileRepository";
import { MessageId, SessionId } from "@/domain/value-objects/ids";

export interface SendUserMessageInput {
  sessionId: string;
  userId: string;
  learnerUtterance: string;
  /** Confidence (0-1) reported by the browser's speech recognizer. */
  recognitionConfidence: number;
}

export interface SendUserMessageOutput {
  learnerMessage: Message;
  tutorMessage: Message;
}

export class SendUserMessage {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly profiles: UserProfileRepository,
    private readonly ids: IdGenerator,
    private readonly conversationGenerator: ConversationGenerator,
    private readonly speechFeedbackEvaluator: SpeechFeedbackEvaluator,
  ) {}

  async execute(input: SendUserMessageInput): Promise<SendUserMessageOutput> {
    const context = await this.sessions.findByIdWithContext(SessionId.of(input.sessionId));
    if (!context || context.session.userId.toString() !== input.userId) {
      throw new NotFoundError(`Conversation session "${input.sessionId}" not found`);
    }
    const { session, scenario, messages } = context;
    if (!session.isActive) {
      throw new SessionNotActiveError(input.sessionId);
    }

    const profile = await this.profiles.findById(session.userId);
    if (!profile) {
      throw new NotFoundError(`Learner profile "${session.userId.toString()}" not found`);
    }

    const history = messages.map((message) => ({ role: message.role, text: message.text }));

    const learnerMessage = Message.learnerUtterance({
      id: MessageId.of(this.ids.generate()),
      sessionId: session.id,
      text: input.learnerUtterance,
      recognitionConfidence: input.recognitionConfidence,
    });

    // Feedback and the tutor's reply are independent LLM calls — run them
    // concurrently instead of paying for two round-trips back-to-back.
    const [feedback, reply] = await Promise.all([
      this.speechFeedbackEvaluator.evaluate({
        scenario,
        learnerLevel: profile.jlptLevel,
        conversationSoFar: history,
        learnerUtterance: input.learnerUtterance,
        recognitionConfidence: input.recognitionConfidence,
      }),
      this.conversationGenerator.generateReply({
        scenario,
        learnerLevel: profile.jlptLevel,
        history: [...history, { role: "learner", text: input.learnerUtterance }],
      }),
    ]);

    learnerMessage.attachFeedback(feedback);
    await this.sessions.addMessage(learnerMessage);

    const tutorMessage = Message.tutorReply({
      id: MessageId.of(this.ids.generate()),
      sessionId: session.id,
      text: reply.text,
    });
    await this.sessions.addMessage(tutorMessage);

    return { learnerMessage, tutorMessage };
  }
}
