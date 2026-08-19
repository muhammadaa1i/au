"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechRecognitionStatus = "idle" | "listening" | "unsupported";

export interface SpeechRecognitionResultData {
  transcript: string;
  confidence: number;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult: (result: SpeechRecognitionResultData) => void;
}

export function useSpeechRecognition({ lang = "ja-JP", onResult }: UseSpeechRecognitionOptions) {
  const [status, setStatus] = useState<SpeechRecognitionStatus>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      // Feature detection can only run client-side, after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const alternative = result[0];
      onResultRef.current({ transcript: alternative.transcript.trim(), confidence: alternative.confidence });
    };
    recognition.onend = () => setStatus((current) => (current === "unsupported" ? current : "idle"));
    recognition.onerror = () => setStatus("idle");

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current || status === "listening") return;
    setStatus("listening");
    recognitionRef.current.start();
  }, [status]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { status, start, stop };
}
