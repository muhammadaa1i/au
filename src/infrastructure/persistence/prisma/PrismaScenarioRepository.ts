import type { JlptLevel as PrismaJlptLevel, Scenario as ScenarioRow } from "@/generated/prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma/client";
import { Scenario } from "@/domain/entities/Scenario";
import { ScenarioFilter, ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { LearnerProfileId, ScenarioId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";

function toDomain(row: ScenarioRow): Scenario {
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

export class PrismaScenarioRepository implements ScenarioRepository {
  async findById(id: ScenarioId): Promise<Scenario | null> {
    const row = await prisma.scenario.findUnique({ where: { id: id.toString() } });
    return row ? toDomain(row) : null;
  }

  async findMany(filter: ScenarioFilter): Promise<Scenario[]> {
    const rows = await prisma.scenario.findMany({
      where: {
        ...(filter.onlyPublished ? { isPublished: true } : {}),
        ...(filter.jlptLevel ? { jlptLevel: filter.jlptLevel.toString() as PrismaJlptLevel } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDomain);
  }

  async save(scenario: Scenario): Promise<void> {
    const jlptLevel = scenario.jlptLevel.toString() as PrismaJlptLevel;
    await prisma.scenario.upsert({
      where: { id: scenario.id.toString() },
      create: {
        id: scenario.id.toString(),
        title: scenario.title,
        description: scenario.description,
        category: scenario.category,
        jlptLevel,
        systemPrompt: scenario.systemPrompt,
        openingLine: scenario.openingLine,
        isPublished: scenario.isPublished,
        createdById: scenario.createdById.toString(),
        createdAt: scenario.createdAt,
        updatedAt: scenario.updatedAt,
      },
      update: {
        title: scenario.title,
        description: scenario.description,
        category: scenario.category,
        jlptLevel,
        systemPrompt: scenario.systemPrompt,
        openingLine: scenario.openingLine,
        isPublished: scenario.isPublished,
        updatedAt: scenario.updatedAt,
      },
    });
  }

  async delete(id: ScenarioId): Promise<void> {
    await prisma.scenario.delete({ where: { id: id.toString() } });
  }
}
