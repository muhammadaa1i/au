"use client";

import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition, type SpeechRecognitionResultData } from "@/hooks/useSpeechRecognition";
import type { Dictionary } from "@/i18n/get-dictionary";

export function VoiceRecorderButton({
  dictionary,
  disabled,
  onResult,
}: {
  dictionary: Dictionary;
  disabled?: boolean;
  onResult: (result: SpeechRecognitionResultData) => void;
}) {
  const { status, start, stop } = useSpeechRecognition({ onResult });

  if (status === "unsupported") {
    return <p className="text-sm text-muted-foreground">{dictionary.practice.micUnsupported}</p>;
  }

  const isListening = status === "listening";

  return (
    <Button
      type="button"
      size="lg"
      variant={isListening ? "destructive" : "default"}
      disabled={disabled}
      onClick={isListening ? stop : start}
      className="gap-2"
    >
      {isListening ? <Square className="size-4" /> : <Mic className="size-4" />}
      {isListening ? dictionary.practice.micListening : dictionary.practice.micStart}
    </Button>
  );
}
