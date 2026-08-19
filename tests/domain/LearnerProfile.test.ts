import { describe, expect, it } from "vitest";
import { LearnerProfile } from "@/domain/entities/LearnerProfile";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { UiLanguage } from "@/domain/value-objects/UiLanguage";
import { LearnerProfileId } from "@/domain/value-objects/ids";

describe("LearnerProfile", () => {
  it("defaults new profiles to N5 / uz / learner role", () => {
    const profile = LearnerProfile.createDefault({
      id: LearnerProfileId.of("learner-1"),
      clerkUserId: "clerk_123",
      displayName: "Aziz",
    });
    expect(profile.jlptLevel.toString()).toBe("N5");
    expect(profile.uiLanguage.toString()).toBe("uz");
    expect(profile.isAdmin).toBe(false);
  });

  it("updates JLPT level and bumps updatedAt", () => {
    const profile = LearnerProfile.createDefault({
      id: LearnerProfileId.of("learner-1"),
      clerkUserId: "clerk_123",
      displayName: "Aziz",
    });
    const before = profile.updatedAt;
    profile.updateJlptLevel(JlptLevel.of("N3"));
    expect(profile.jlptLevel.toString()).toBe("N3");
    expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("updates UI language", () => {
    const profile = LearnerProfile.createDefault({
      id: LearnerProfileId.of("learner-1"),
      clerkUserId: "clerk_123",
      displayName: "Aziz",
    });
    profile.updateUiLanguage(UiLanguage.of("ru"));
    expect(profile.uiLanguage.toString()).toBe("ru");
  });

  it("rejects an empty display name", () => {
    const profile = LearnerProfile.createDefault({
      id: LearnerProfileId.of("learner-1"),
      clerkUserId: "clerk_123",
      displayName: "Aziz",
    });
    expect(() => profile.updateDisplayName("   ")).toThrow();
  });
});
