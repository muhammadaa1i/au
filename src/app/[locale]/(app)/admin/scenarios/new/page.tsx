import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireAdminProfile } from "@/lib/auth/current-profile";
import { createScenario } from "../actions";
import { ScenarioForm } from "../scenario-form";

export default async function NewScenarioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await requireAdminProfile();

  const dictionary = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.admin.newScenario}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScenarioForm
            dictionary={dictionary}
            action={createScenario.bind(null, locale)}
            submitLabel={dictionary.common.create}
          />
        </CardContent>
      </Card>
    </div>
  );
}
