import { describe, expect, it } from "vitest";
import { EnsureLearnerProfile } from "@/application/use-cases/profile/EnsureLearnerProfile";
import { UpdateLearnerProfile } from "@/application/use-cases/profile/UpdateLearnerProfile";
import { NotFoundError } from "@/application/errors/ApplicationError";
import { FakeUserProfileRepository } from "../../fakes/FakeUserProfileRepository";
import { FakeIdGenerator } from "../../fakes/FakeIdGenerator";

describe("EnsureLearnerProfile", () => {
  it("creates a default profile for a first-time Clerk user", async () => {
    const repo = new FakeUserProfileRepository();
    const profile = await new EnsureLearnerProfile(repo, new FakeIdGenerator()).execute({
      clerkUserId: "clerk_1",
      displayName: "Aziz",
    });

    expect(profile.jlptLevel.toString()).toBe("N5");
    expect(await repo.findByClerkUserId("clerk_1")).toBe(profile);
  });

  it("is idempotent — returns the existing profile on a second call", async () => {
    const repo = new FakeUserProfileRepository();
    const useCase = new EnsureLearnerProfile(repo, new FakeIdGenerator());

    const first = await useCase.execute({ clerkUserId: "clerk_1", displayName: "Aziz" });
    const second = await useCase.execute({ clerkUserId: "clerk_1", displayName: "Aziz" });

    expect(second.id.equals(first.id)).toBe(true);
  });
});

describe("UpdateLearnerProfile", () => {
  it("updates only the provided fields", async () => {
    const repo = new FakeUserProfileRepository();
    const created = await new EnsureLearnerProfile(repo, new FakeIdGenerator()).execute({
      clerkUserId: "clerk_1",
      displayName: "Aziz",
    });

    const updated = await new UpdateLearnerProfile(repo).execute({
      userId: created.id.toString(),
      jlptLevel: "N2",
    });

    expect(updated.jlptLevel.toString()).toBe("N2");
    expect(updated.displayName).toBe("Aziz");
  });

  it("throws NotFoundError for an unknown profile", async () => {
    const repo = new FakeUserProfileRepository();
    await expect(
      new UpdateLearnerProfile(repo).execute({ userId: "missing", jlptLevel: "N1" }),
    ).rejects.toThrow(NotFoundError);
  });
});
