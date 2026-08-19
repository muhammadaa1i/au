"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { container } from "@/di/container";
import { JLPT_LEVELS } from "@/domain/value-objects/JlptLevel";
import { UI_LANGUAGES } from "@/domain/value-objects/UiLanguage";
import { requireLearnerProfile } from "@/lib/auth/current-profile";

const onboardingSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  jlptLevel: z.enum(JLPT_LEVELS),
  uiLanguage: z.enum(UI_LANGUAGES),
});

export interface OnboardingFormState {
  error?: string;
}

export async function updateOnboardingProfile(
  _prevState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const profile = await requireLearnerProfile();

  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    jlptLevel: formData.get("jlptLevel"),
    uiLanguage: formData.get("uiLanguage"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const updated = await container.updateLearnerProfile.execute({
    userId: profile.id.toString(),
    ...parsed.data,
  });

  redirect(`/${updated.uiLanguage.toString()}/dashboard`);
}
