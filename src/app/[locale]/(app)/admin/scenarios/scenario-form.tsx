"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS, type JlptLevelValue } from "@/domain/value-objects/JlptLevel";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { ScenarioFormState } from "./actions";

export interface ScenarioFormValues {
  title: string;
  description: string;
  category: string;
  jlptLevel: JlptLevelValue;
  systemPrompt: string;
  openingLine: string;
}

const initialState: ScenarioFormState = {};

export function ScenarioForm({
  dictionary,
  action,
  defaultValues,
  submitLabel,
}: {
  dictionary: Dictionary;
  action: (prevState: ScenarioFormState, formData: FormData) => Promise<ScenarioFormState>;
  defaultValues?: Partial<ScenarioFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="title">{dictionary.admin.form.title}</FieldLabel>
        <Input id="title" name="title" defaultValue={defaultValues?.title} required maxLength={120} />
      </Field>

      <Field>
        <FieldLabel htmlFor="description">{dictionary.admin.form.description}</FieldLabel>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          required
          maxLength={500}
          rows={2}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="category">{dictionary.admin.form.category}</FieldLabel>
        <Input id="category" name="category" defaultValue={defaultValues?.category} required maxLength={60} />
      </Field>

      <Field>
        <FieldLabel htmlFor="jlptLevel">{dictionary.admin.form.jlptLevel}</FieldLabel>
        <Select name="jlptLevel" defaultValue={defaultValues?.jlptLevel ?? "N5"}>
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
        <FieldLabel htmlFor="systemPrompt">{dictionary.admin.form.systemPrompt}</FieldLabel>
        <Textarea
          id="systemPrompt"
          name="systemPrompt"
          defaultValue={defaultValues?.systemPrompt}
          required
          maxLength={4000}
          rows={5}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="openingLine">{dictionary.admin.form.openingLine}</FieldLabel>
        <Input
          id="openingLine"
          name="openingLine"
          defaultValue={defaultValues?.openingLine}
          required
          maxLength={300}
        />
      </Field>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? dictionary.common.saving : submitLabel}
      </Button>
    </form>
  );
}
