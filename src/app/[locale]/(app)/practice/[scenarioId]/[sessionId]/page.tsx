import { notFound } from "next/navigation";
import { NotFoundError } from "@/application/errors/ApplicationError";
import { container } from "@/di/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireLearnerProfile } from "@/lib/auth/current-profile";
import { toMessageDTO } from "../../message-dto";
import { PracticeChat } from "./practice-chat";

// sendPracticeMessage (invoked from PracticeChat) makes two concurrent Gemini
// calls that have been observed taking 20-27s on the free tier — well past
// Vercel's default Server Action timeout (10s on Hobby).
export const maxDuration = 60;

export default async function PracticeSessionPage({
  params,
}: {
  params: Promise<{ locale: string; scenarioId: string; sessionId: string }>;
}) {
  const { locale, sessionId } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const profile = await requireLearnerProfile();

  const detail = await container.getSessionDetail.execute(sessionId, profile.id.toString()).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return (
    <PracticeChat
      locale={locale}
      sessionId={sessionId}
      scenario={{ title: detail.scenario.title, jlptLevel: detail.scenario.jlptLevel.toString() }}
      initialMessages={detail.messages.map(toMessageDTO)}
      isSessionActive={detail.session.isActive}
      dictionary={dictionary}
    />
  );
}
