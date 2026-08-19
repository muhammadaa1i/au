import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { container } from "@/di/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireLearnerProfile } from "@/lib/auth/current-profile";

export default async function HistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const profile = await requireLearnerProfile();
  const history = await container.getLearningHistory.execute(profile.id.toString());

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">{dictionary.history.title}</h1>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dictionary.history.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((entry) => (
            <Card key={entry.session.id.toString()}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/${locale}/practice/${entry.scenario.id.toString()}/${entry.session.id.toString()}`}
                    className="font-medium hover:underline"
                  >
                    {entry.scenario.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.session.startedAt.toLocaleDateString(locale)}</span>
                    <Badge variant={entry.session.status === "completed" ? "default" : "secondary"}>
                      {dictionary.history.status[entry.session.status]}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end text-sm">
                  <span className="text-muted-foreground">{dictionary.history.averageScore}</span>
                  <span className="text-lg font-semibold">{entry.averageScore.valueOf()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
