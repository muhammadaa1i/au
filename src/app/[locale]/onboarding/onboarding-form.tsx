"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Dictionary } from "@/i18n/get-dictionary";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { JLPT_LEVELS, type JlptLevelValue } from "@/domain/value-objects/JlptLevel";
import { updateOnboardingProfile, type OnboardingFormState } from "./actions";

const initialState: OnboardingFormState = {};

export function OnboardingForm({
  dictionary,
  defaultDisplayName,
  defaultJlptLevel,
  defaultUiLanguage,
}: {
  dictionary: Dictionary;
  defaultDisplayName: string;
  defaultJlptLevel: JlptLevelValue;
  defaultUiLanguage: Locale;
}) {
  const [state, formAction, isPending] = useActionState(updateOnboardingProfile, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="displayName">{dictionary.onboarding.displayName}</FieldLabel>
        <Input id="displayName" name="displayName" defaultValue={defaultDisplayName} required maxLength={80} />
      </Field>

      <Field>
        <FieldLabel htmlFor="jlptLevel">{dictionary.onboarding.jlptLevel}</FieldLabel>
        <Select name="jlptLevel" defaultValue={defaultJlptLevel}>
          <SelectTrigger id="jlptLevel" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JLPT_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="uiLanguage">{dictionary.onboarding.uiLanguage}</FieldLabel>
        <Select name="uiLanguage" defaultValue={defaultUiLanguage}>
          <SelectTrigger id="uiLanguage" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locales.map((locale) => (
              <SelectItem key={locale} value={locale}>
                {localeNames[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? dictionary.common.saving : dictionary.onboarding.submit}
      </Button>
    </form>
  );
}
