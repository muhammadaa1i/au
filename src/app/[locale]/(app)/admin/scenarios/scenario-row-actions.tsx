"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/get-dictionary";
import { deleteScenarioAction, toggleScenarioPublished } from "./actions";

export function ScenarioRowActions({
  locale,
  scenarioId,
  isPublished,
  dictionary,
}: {
  locale: string;
  scenarioId: string;
  isPublished: boolean;
  dictionary: Dictionary;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleTogglePublish() {
    startTransition(async () => {
      await toggleScenarioPublished(locale, scenarioId, !isPublished);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(dictionary.admin.confirmDelete)) return;
    startTransition(async () => {
      await deleteScenarioAction(locale, scenarioId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" disabled={isPending} onClick={handleTogglePublish}>
        {isPublished ? dictionary.admin.unpublish : dictionary.admin.publish}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        render={<Link href={`/${locale}/admin/scenarios/${scenarioId}/edit`} />}
        nativeButton={false}
      >
        <Pencil className="size-4" />
      </Button>
      <Button size="sm" variant="ghost" disabled={isPending} onClick={handleDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
