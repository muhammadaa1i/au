import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { container } from "@/di/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { interpolate } from "@/i18n/interpolate";
import { requireLearnerProfile } from "@/lib/auth/current-profile";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const profile = await requireLearnerProfile();
  const history = await container.getLearningHistory.execute(profile.id.toString());
  const recentSessions = history.slice(0, 5);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {interpolate(dictionary.dashboard.welcome, { name: profile.displayName })}
        </h1>
        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
          {dictionary.dashboard.yourLevel}
          <Badge variant="secondary">{profile.jlptLevel.toString()}</Badge>
        </p>
      </div>

      <Button render={<Link href={`/${locale}/scenarios`} />} nativeButton={false} size="lg" className="w-fit">
        {dictionary.dashboard.browseScenarios}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.dashboard.recentSessions}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dictionary.dashboard.noSessions}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentSessions.map((entry) => (
                <li key={entry.session.id.toString()} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <Link
                      href={`/${locale}/practice/${entry.scenario.id.toString()}/${entry.session.id.toString()}`}
                      className="font-medium hover:underline"
                    >
                      {entry.scenario.title}
                    </Link>
                    <span className="text-muted-foreground">
                      {entry.session.startedAt.toLocaleDateString(locale)}
                    </span>
                  </div>
                  <Badge variant={entry.session.status === "completed" ? "default" : "secondary"}>
                    {entry.averageScore.valueOf()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
