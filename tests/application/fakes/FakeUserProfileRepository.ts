import { LearnerProfile } from "@/domain/entities/LearnerProfile";
import { UserProfileRepository } from "@/domain/ports/UserProfileRepository";
import { LearnerProfileId } from "@/domain/value-objects/ids";

export class FakeUserProfileRepository implements UserProfileRepository {
  private readonly profiles = new Map<string, LearnerProfile>();

  async findById(id: LearnerProfileId): Promise<LearnerProfile | null> {
    return this.profiles.get(id.toString()) ?? null;
  }

  async findByClerkUserId(clerkUserId: string): Promise<LearnerProfile | null> {
    return [...this.profiles.values()].find((profile) => profile.clerkUserId === clerkUserId) ?? null;
  }

  async save(profile: LearnerProfile): Promise<void> {
    this.profiles.set(profile.id.toString(), profile);
  }

  seed(profile: LearnerProfile): void {
    this.profiles.set(profile.id.toString(), profile);
  }
}
