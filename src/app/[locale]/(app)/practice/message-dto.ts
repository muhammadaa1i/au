import { Message } from "@/domain/entities/Message";

export interface MessageDTO {
  id: string;
  role: "learner" | "tutor";
  text: string;
  createdAt: string;
  feedback: {
    overallScore: number;
    grammarNotes: string[];
    naturalnessNotes: string[];
    suggestedCorrection: string | null;
  } | null;
}

export function toMessageDTO(message: Message): MessageDTO {
  return {
    id: message.id.toString(),
    role: message.role,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
    feedback: message.feedback ? message.feedback.toJSON() : null,
  };
}
