"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import type { Dictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/interpolate";
import { endPracticeSession, sendPracticeMessage } from "../../actions";
import type { MessageDTO } from "../../message-dto";
import { MessageBubble } from "./message-bubble";
import { VoiceRecorderButton } from "./voice-recorder-button";

interface PracticeChatProps {
  locale: string;
  sessionId: string;
  scenario: { title: string; jlptLevel: string };
  initialMessages: MessageDTO[];
  isSessionActive: boolean;
  dictionary: Dictionary;
}

export function PracticeChat({
  locale,
  sessionId,
  scenario,
  initialMessages,
  isSessionActive,
  dictionary,
}: PracticeChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [isActive, setIsActive] = useState(isSessionActive);
  const [typedText, setTypedText] = useState("");
  const [summary, setSummary] = useState<number | null>(null);
  const [isSending, startSending] = useTransition();
  const [isEnding, startEnding] = useTransition();
  const { speak } = useSpeechSynthesis();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasSpokenOpeningRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (hasSpokenOpeningRef.current || !isSessionActive) return;
    hasSpokenOpeningRef.current = true;
    const opening = initialMessages.at(-1);
    if (opening?.role === "tutor") {
      speak(opening.text);
    }
    // Only ever speak the opening line once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitUtterance(transcript: string, confidence: number) {
    if (!transcript || !isActive) return;
    startSending(async () => {
      const { learnerMessage, tutorMessage } = await sendPracticeMessage({
        sessionId,
        learnerUtterance: transcript,
        recognitionConfidence: confidence,
      });
      setMessages((current) => [...current, learnerMessage, tutorMessage]);
      speak(tutorMessage.text);
    });
  }

  function handleTypedSubmit(event: FormEvent) {
    event.preventDefault();
    const text = typedText.trim();
    if (!text) return;
    setTypedText("");
    submitUtterance(text, 1);
  }

  function handleEndSession() {
    startEnding(async () => {
      const { averageScore } = await endPracticeSession(sessionId);
      setIsActive(false);
      setSummary(averageScore);
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{scenario.title}</h1>
          <Badge variant="secondary">{scenario.jlptLevel}</Badge>
        </div>
        {isActive && (
          <Button variant="outline" size="sm" onClick={handleEndSession} disabled={isEnding}>
            {dictionary.practice.endSession}
          </Button>
        )}
      </div>

      {summary !== null && (
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.practice.sessionEndedTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p>{interpolate(dictionary.practice.sessionSummary, { score: summary })}</p>
            <div className="flex gap-2">
              <Button render={<Link href={`/${locale}/scenarios`} />} nativeButton={false} variant="outline">
                {dictionary.practice.backToScenarios}
              </Button>
              <Button render={<Link href={`/${locale}/history`} />} nativeButton={false}>
                {dictionary.practice.viewHistory}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 rounded-lg border p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} dictionary={dictionary} />
        ))}
        <div ref={bottomRef} />
      </div>

      {isActive && (
        <div className="flex flex-col gap-3">
          <form onSubmit={handleTypedSubmit} className="flex gap-2">
            <Input
              value={typedText}
              onChange={(event) => setTypedText(event.target.value)}
              placeholder={dictionary.practice.typePlaceholder}
              disabled={isSending}
            />
            <Button type="submit" disabled={isSending || !typedText.trim()}>
              {dictionary.practice.send}
            </Button>
          </form>
          <VoiceRecorderButton
            dictionary={dictionary}
            disabled={isSending}
            onResult={({ transcript, confidence }) => submitUtterance(transcript, confidence)}
          />
        </div>
      )}
    </div>
  );
}
