import { NotFoundError } from "@/application/errors/ApplicationError";
import { LearnerProfile } from "@/domain/entities/LearnerProfile";
import { UserProfileRepository } from "@/domain/ports/UserProfileRepository";
import { JlptLevel, JlptLevelValue } from "@/domain/value-objects/JlptLevel";
import { UiLanguage, UiLanguageValue } from "@/domain/value-objects/UiLanguage";
import { LearnerProfileId } from "@/domain/value-objects/ids";

export interface UpdateLearnerProfileInput {
  userId: string;
  displayName?: string;
  jlptLevel?: JlptLevelValue;
  uiLanguage?: UiLanguageValue;
}

export class UpdateLearnerProfile {
  constructor(private readonly profiles: UserProfileRepository) {}

  async execute(input: UpdateLearnerProfileInput): Promise<LearnerProfile> {
    const profile = await this.profiles.findById(LearnerProfileId.of(input.userId));
    if (!profile) {
      throw new NotFoundError(`Learner profile "${input.userId}" not found`);
    }

    if (input.displayName !== undefined) {
      profile.updateDisplayName(input.displayName);
    }
    if (input.jlptLevel !== undefined) {
      profile.updateJlptLevel(JlptLevel.of(input.jlptLevel));
    }
    if (input.uiLanguage !== undefined) {
      profile.updateUiLanguage(UiLanguage.of(input.uiLanguage));
    }

    await this.profiles.save(profile);
    return profile;
  }
}
