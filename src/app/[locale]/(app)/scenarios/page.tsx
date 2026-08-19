import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { container } from "@/di/container";
import { JLPT_LEVELS, type JlptLevelValue } from "@/domain/value-objects/JlptLevel";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function ScenariosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ level?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { level } = await searchParams;
  const selectedLevel =
    level && (JLPT_LEVELS as readonly string[]).includes(level) ? (level as JlptLevelValue) : undefined;

  const dictionary = await getDictionary(locale);
  const scenarios = await container.listScenarios.execute({ onlyPublished: true, jlptLevel: selectedLevel });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{dictionary.scenarios.title}</h1>
        <p className="text-sm text-muted-foreground">{dictionary.scenarios.filterByLevel}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <LevelFilterLink label={dictionary.scenarios.allLevels} active={!selectedLevel} href={`/${locale}/scenarios`} />
        {JLPT_LEVELS.map((jlptLevel) => (
          <LevelFilterLink
            key={jlptLevel}
            label={jlptLevel}
            active={selectedLevel === jlptLevel}
            href={`/${locale}/scenarios?level=${jlptLevel}`}
          />
        ))}
      </div>

      {scenarios.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dictionary.scenarios.empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {scenarios.map((scenario) => (
            <Card key={scenario.id.toString()}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{scenario.title}</CardTitle>
                  <Badge variant="secondary">{scenario.jlptLevel.toString()}</Badge>
                </div>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter>
                <Button
                  render={<Link href={`/${locale}/practice/${scenario.id.toString()}`} />}
                  nativeButton={false}
                  className="w-full"
                >
                  {dictionary.scenarios.startPractice}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LevelFilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Button render={<Link href={href} />} nativeButton={false} size="sm" variant={active ? "default" : "outline"}>
      {label}
    </Button>
  );
}
