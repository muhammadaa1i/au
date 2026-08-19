import { EmptyMessageTextError, FeedbackNotAllowedForTutorMessageError } from "@/domain/errors/DomainError";
import { LanguageFeedback } from "@/domain/value-objects/LanguageFeedback";
import { MessageId, SessionId } from "@/domain/value-objects/ids";

export type MessageRoleValue = "learner" | "tutor";

export interface MessageProps {
  id: MessageId;
  sessionId: SessionId;
  role: MessageRoleValue;
  text: string;
  recognitionConfidence: number | null;
  feedback: LanguageFeedback | null;
  createdAt: Date;
}

export class Message {
  private constructor(private props: MessageProps) {}

  static learnerUtterance(props: {
    id: MessageId;
    sessionId: SessionId;
    text: string;
    recognitionConfidence: number;
  }): Message {
    Message.validateText(props.text);
    return new Message({
      ...props,
      role: "learner",
      feedback: null,
      createdAt: new Date(),
    });
  }

  static tutorReply(props: { id: MessageId; sessionId: SessionId; text: string }): Message {
    Message.validateText(props.text);
    return new Message({
      ...props,
      role: "tutor",
      recognitionConfidence: null,
      feedback: null,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: MessageProps): Message {
    return new Message(props);
  }

  private static validateText(text: string): void {
    if (!text.trim()) {
      throw new EmptyMessageTextError();
    }
  }

  attachFeedback(feedback: LanguageFeedback): void {
    if (this.props.role !== "learner") {
      throw new FeedbackNotAllowedForTutorMessageError();
    }
    this.props.feedback = feedback;
  }

  get id(): MessageId {
    return this.props.id;
  }

  get sessionId(): SessionId {
    return this.props.sessionId;
  }

  get role(): MessageRoleValue {
    return this.props.role;
  }

  get text(): string {
    return this.props.text;
  }

  get recognitionConfidence(): number | null {
    return this.props.recognitionConfidence;
  }

  get feedback(): LanguageFeedback | null {
    return this.props.feedback;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
