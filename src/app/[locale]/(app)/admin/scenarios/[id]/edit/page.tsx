import { notFound } from "next/navigation";
import { NotFoundError } from "@/application/errors/ApplicationError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { container } from "@/di/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireAdminProfile } from "@/lib/auth/current-profile";
import { updateScenarioAction } from "../../actions";
import { ScenarioForm } from "../../scenario-form";

export default async function EditScenarioPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  await requireAdminProfile();

  const dictionary = await getDictionary(locale);
  const scenario = await container.getScenario.execute(id).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.admin.editScenario}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScenarioForm
            dictionary={dictionary}
            action={updateScenarioAction.bind(null, locale, id)}
            defaultValues={{
              title: scenario.title,
              description: scenario.description,
              category: scenario.category,
              jlptLevel: scenario.jlptLevel.toString(),
              systemPrompt: scenario.systemPrompt,
              openingLine: scenario.openingLine,
            }}
            submitLabel={dictionary.common.save}
          />
        </CardContent>
      </Card>
    </div>
  );
}
