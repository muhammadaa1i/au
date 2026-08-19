import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotFoundError } from "@/application/errors/ApplicationError";
import { container } from "@/di/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { StartPracticeButton } from "./start-practice-button";

export default async function PracticeIntroPage({
  params,
}: {
  params: Promise<{ locale: string; scenarioId: string }>;
}) {
  const { locale, scenarioId } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  const scenario = await container.getScenario.execute(scenarioId).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });
  if (!scenario.isPublished) notFound();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{scenario.title}</CardTitle>
            <Badge variant="secondary">{scenario.jlptLevel.toString()}</Badge>
          </div>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <StartPracticeButton
            scenarioId={scenario.id.toString()}
            locale={locale}
            label={dictionary.scenarios.startPractice}
            errorLabel={dictionary.common.error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
