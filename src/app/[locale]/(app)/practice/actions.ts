"use server";

import { container } from "@/di/container";
import { requireLearnerProfile } from "@/lib/auth/current-profile";
import { toMessageDTO, type MessageDTO } from "./message-dto";

export interface StartPracticeSessionResult {
  sessionId: string;
  openingMessage: MessageDTO;
}

export async function startPracticeSession(scenarioId: string): Promise<StartPracticeSessionResult> {
  const profile = await requireLearnerProfile();
  const { session, openingMessage } = await container.startConversationSession.execute({
    userId: profile.id.toString(),
    scenarioId,
  });
  return { sessionId: session.id.toString(), openingMessage: toMessageDTO(openingMessage) };
}

export interface SendPracticeMessageInput {
  sessionId: string;
  learnerUtterance: string;
  recognitionConfidence: number;
}

export interface SendPracticeMessageResult {
  learnerMessage: MessageDTO;
  tutorMessage: MessageDTO;
}

export async function sendPracticeMessage(
  input: SendPracticeMessageInput,
): Promise<SendPracticeMessageResult> {
  const profile = await requireLearnerProfile();
  const { learnerMessage, tutorMessage } = await container.sendUserMessage.execute({
    ...input,
    userId: profile.id.toString(),
  });
  return { learnerMessage: toMessageDTO(learnerMessage), tutorMessage: toMessageDTO(tutorMessage) };
}

export interface EndPracticeSessionResult {
  averageScore: number;
}

export async function endPracticeSession(sessionId: string): Promise<EndPracticeSessionResult> {
  const profile = await requireLearnerProfile();
  const { averageScore } = await container.endConversationSession.execute(sessionId, profile.id.toString());
  return { averageScore: averageScore.valueOf() };
}
