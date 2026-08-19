import type {
  ConversationSession as SessionRow,
  Message as MessageRow,
  MessageRole as PrismaMessageRole,
  Scenario as ScenarioRow,
  SessionStatus as PrismaSessionStatus,
} from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma/client";
import { ConversationSession } from "@/domain/entities/ConversationSession";
import { Message } from "@/domain/entities/Message";
import { Scenario } from "@/domain/entities/Scenario";
import { SessionRepository, SessionWithContext } from "@/domain/ports/SessionRepository";
import { LanguageFeedback, LanguageFeedbackJSON } from "@/domain/value-objects/LanguageFeedback";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { LearnerProfileId, MessageId, ScenarioId, SessionId } from "@/domain/value-objects/ids";

function scenarioToDomain(row: ScenarioRow): Scenario {
  return Scenario.reconstitute({
    id: ScenarioId.of(row.id),
    title: row.title,
    description: row.description,
    category: row.category,
    jlptLevel: JlptLevel.of(row.jlptLevel),
    systemPrompt: row.systemPrompt,
    openingLine: row.openingLine,
    isPublished: row.isPublished,
    createdById: LearnerProfileId.of(row.createdById),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function sessionToDomain(row: SessionRow): ConversationSession {
  return ConversationSession.reconstitute({
    id: SessionId.of(row.id),
    userId: LearnerProfileId.of(row.userId),
    scenarioId: ScenarioId.of(row.scenarioId),
    status: row.status,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
  });
}

function messageToDomain(row: MessageRow): Message {
  return Message.reconstitute({
    id: MessageId.of(row.id),
    sessionId: SessionId.of(row.sessionId),
    role: row.role,
    text: row.text,
    recognitionConfidence: row.recognitionConfidence,
    feedback: row.feedback
      ? LanguageFeedback.fromJSON(row.feedback as unknown as LanguageFeedbackJSON)
      : null,
    createdAt: row.createdAt,
  });
}

function feedbackToJson(message: Message): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return message.feedback ? (message.feedback.toJSON() as unknown as Prisma.InputJsonValue) : Prisma.JsonNull;
}

const sessionWithContextInclude = {
  scenario: true,
  messages: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.ConversationSessionInclude;

export class PrismaSessionRepository implements SessionRepository {
  async save(session: ConversationSession): Promise<void> {
    await prisma.conversationSession.upsert({
      where: { id: session.id.toString() },
      create: {
        id: session.id.toString(),
        userId: session.userId.toString(),
        scenarioId: session.scenarioId.toString(),
        status: session.status as PrismaSessionStatus,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
      },
      update: {
        status: session.status as PrismaSessionStatus,
        endedAt: session.endedAt,
      },
    });
  }

  async findById(id: SessionId): Promise<ConversationSession | null> {
    const row = await prisma.conversationSession.findUnique({ where: { id: id.toString() } });
    return row ? sessionToDomain(row) : null;
  }

  async findByIdWithContext(id: SessionId): Promise<SessionWithContext | null> {
    const row = await prisma.conversationSession.findUnique({
      where: { id: id.toString() },
      include: sessionWithContextInclude,
    });
    if (!row) return null;
    return {
      session: sessionToDomain(row),
      scenario: scenarioToDomain(row.scenario),
      messages: row.messages.map(messageToDomain),
    };
  }

  async findByUser(userId: LearnerProfileId): Promise<SessionWithContext[]> {
    const rows = await prisma.conversationSession.findMany({
      where: { userId: userId.toString() },
      include: sessionWithContextInclude,
      orderBy: { startedAt: "desc" },
    });
    return rows.map((row) => ({
      session: sessionToDomain(row),
      scenario: scenarioToDomain(row.scenario),
      messages: row.messages.map(messageToDomain),
    }));
  }

  async addMessage(message: Message): Promise<void> {
    await prisma.message.create({
      data: {
        id: message.id.toString(),
        sessionId: message.sessionId.toString(),
        role: message.role as PrismaMessageRole,
        text: message.text,
        recognitionConfidence: message.recognitionConfidence,
        feedback: feedbackToJson(message),
        createdAt: message.createdAt,
      },
    });
  }
}
