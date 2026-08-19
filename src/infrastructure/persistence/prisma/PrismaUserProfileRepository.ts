import type {
  JlptLevel as PrismaJlptLevel,
  LearnerProfile as LearnerProfileRow,
  LearnerRole as PrismaLearnerRole,
  UiLanguage as PrismaUiLanguage,
} from "@/generated/prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma/client";
import { LearnerProfile } from "@/domain/entities/LearnerProfile";
import { UserProfileRepository } from "@/domain/ports/UserProfileRepository";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { UiLanguage } from "@/domain/value-objects/UiLanguage";
import { LearnerProfileId } from "@/domain/value-objects/ids";

function toDomain(row: LearnerProfileRow): LearnerProfile {
  return LearnerProfile.reconstitute({
    id: LearnerProfileId.of(row.id),
    clerkUserId: row.clerkUserId,
    displayName: row.displayName,
    uiLanguage: UiLanguage.of(row.uiLanguage),
    jlptLevel: JlptLevel.of(row.jlptLevel),
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaUserProfileRepository implements UserProfileRepository {
  async findById(id: LearnerProfileId): Promise<LearnerProfile | null> {
    const row = await prisma.learnerProfile.findUnique({ where: { id: id.toString() } });
    return row ? toDomain(row) : null;
  }

  async findByClerkUserId(clerkUserId: string): Promise<LearnerProfile | null> {
    const row = await prisma.learnerProfile.findUnique({ where: { clerkUserId } });
    return row ? toDomain(row) : null;
  }

  async save(profile: LearnerProfile): Promise<void> {
    const uiLanguage = profile.uiLanguage.toString() as PrismaUiLanguage;
    const jlptLevel = profile.jlptLevel.toString() as PrismaJlptLevel;
    const role = profile.role as PrismaLearnerRole;

    await prisma.learnerProfile.upsert({
      where: { id: profile.id.toString() },
      create: {
        id: profile.id.toString(),
        clerkUserId: profile.clerkUserId,
        displayName: profile.displayName,
        uiLanguage,
        jlptLevel,
        role,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
      update: {
        displayName: profile.displayName,
        uiLanguage,
        jlptLevel,
        role,
        updatedAt: profile.updatedAt,
      },
    });
  }
}
