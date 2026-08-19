"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { container } from "@/di/container";
import { JLPT_LEVELS } from "@/domain/value-objects/JlptLevel";
import { requireAdminProfile } from "@/lib/auth/current-profile";

const scenarioSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  category: z.string().trim().min(1).max(60),
  jlptLevel: z.enum(JLPT_LEVELS),
  systemPrompt: z.string().trim().min(1).max(4000),
  openingLine: z.string().trim().min(1).max(300),
});

export interface ScenarioFormState {
  error?: string;
}

export async function createScenario(
  locale: string,
  _prevState: ScenarioFormState,
  formData: FormData,
): Promise<ScenarioFormState> {
  const profile = await requireAdminProfile();
  const parsed = scenarioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await container.createScenario.execute({ createdById: profile.id.toString(), ...parsed.data });

  revalidatePath(`/${locale}/admin/scenarios`);
  redirect(`/${locale}/admin/scenarios`);
}

export async function updateScenarioAction(
  locale: string,
  scenarioId: string,
  _prevState: ScenarioFormState,
  formData: FormData,
): Promise<ScenarioFormState> {
  await requireAdminProfile();
  const parsed = scenarioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await container.updateScenario.execute({ id: scenarioId, ...parsed.data });

  revalidatePath(`/${locale}/admin/scenarios`);
  redirect(`/${locale}/admin/scenarios`);
}

export async function toggleScenarioPublished(
  locale: string,
  scenarioId: string,
  isPublished: boolean,
): Promise<void> {
  await requireAdminProfile();
  await container.setScenarioPublished.execute(scenarioId, isPublished);
  revalidatePath(`/${locale}/admin/scenarios`);
}

export async function deleteScenarioAction(locale: string, scenarioId: string): Promise<void> {
  await requireAdminProfile();
  await container.deleteScenario.execute(scenarioId);
  revalidatePath(`/${locale}/admin/scenarios`);
}
