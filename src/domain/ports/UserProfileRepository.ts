import { LearnerProfile } from "@/domain/entities/LearnerProfile";
import { LearnerProfileId } from "@/domain/value-objects/ids";

export interface UserProfileRepository {
  findById(id: LearnerProfileId): Promise<LearnerProfile | null>;
  findByClerkUserId(clerkUserId: string): Promise<LearnerProfile | null>;
  save(profile: LearnerProfile): Promise<void>;
}
