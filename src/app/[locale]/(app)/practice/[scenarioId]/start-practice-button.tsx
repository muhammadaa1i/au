"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startPracticeSession } from "../actions";

export function StartPracticeButton({
  scenarioId,
  locale,
  label,
  errorLabel,
}: {
  scenarioId: string;
  locale: string;
  label: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const { sessionId } = await startPracticeSession(scenarioId);
        router.push(`/${locale}/practice/${scenarioId}/${sessionId}`);
      } catch {
        setError(errorLabel);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={handleClick} disabled={isPending} className="w-full">
        {label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
