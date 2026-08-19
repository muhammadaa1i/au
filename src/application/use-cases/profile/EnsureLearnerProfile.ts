import { LearnerProfile } from "@/domain/entities/LearnerProfile";
import { IdGenerator } from "@/domain/ports/IdGenerator";
import { UserProfileRepository } from "@/domain/ports/UserProfileRepository";
import { LearnerProfileId } from "@/domain/value-objects/ids";

export interface EnsureLearnerProfileInput {
  clerkUserId: string;
  displayName: string;
}

/** Idempotent: returns the existing profile if one already exists for this Clerk user. */
export class EnsureLearnerProfile {
  constructor(
    private readonly profiles: UserProfileRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: EnsureLearnerProfileInput): Promise<LearnerProfile> {
    const existing = await this.profiles.findByClerkUserId(input.clerkUserId);
    if (existing) {
      return existing;
    }

    const profile = LearnerProfile.createDefault({
      id: LearnerProfileId.of(this.ids.generate()),
      clerkUserId: input.clerkUserId,
      displayName: input.displayName,
    });
    await this.profiles.save(profile);
    return profile;
  }
}
