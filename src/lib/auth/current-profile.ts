import "server-only";
import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { container } from "@/di/container";
import { LearnerProfile } from "@/domain/entities/LearnerProfile";

/**
 * Resolves the signed-in user's LearnerProfile, creating it lazily if the
 * Clerk `user.created` webhook hasn't landed yet (e.g. immediately after
 * sign-up). proxy.ts already blocks unauthenticated access to routes that
 * call this, so the redirect below is a defensive fallback, not the primary
 * auth gate.
 *
 * Wrapped in React's `cache()` because both the `(app)` layout and several
 * pages under it call this independently on every navigation — without
 * request-scoped memoization that meant two Clerk `auth()` calls and two
 * profile lookups per page load.
 */
export const requireLearnerProfile = cache(async (): Promise<LearnerProfile> => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const existing = await container.profiles.findByClerkUserId(userId);
  if (existing) {
    return existing;
  }

  const user = await currentUser();
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Learner";

  return container.ensureLearnerProfile.execute({ clerkUserId: userId, displayName });
});

export async function requireAdminProfile(): Promise<LearnerProfile> {
  const profile = await requireLearnerProfile();
  if (!profile.isAdmin) {
    notFound();
  }
  return profile;
}
