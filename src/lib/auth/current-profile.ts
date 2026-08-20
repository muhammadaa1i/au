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

/**
 * Just the Clerk user ID — no database round trip (Clerk's session is
 * already verified per-request by proxy.ts). Use this instead of
 * `requireLearnerProfile()` when a page needs to scope a query to "the
 * current user" but doesn't need the LearnerProfile row itself (e.g.
 * `history`), or wants to fetch the profile and other user-scoped data in
 * parallel instead of the profile blocking everything else.
 */
export const requireClerkUserId = cache(async (): Promise<string> => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }
  return userId;
});
