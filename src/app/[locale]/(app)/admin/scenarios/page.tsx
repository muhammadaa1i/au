import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { container } from "@/di/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireAdminProfile } from "@/lib/auth/current-profile";
import { ScenarioRowActions } from "./scenario-row-actions";

export default async function AdminScenariosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await requireAdminProfile();

  const dictionary = await getDictionary(locale);
  const scenarios = await container.listScenarios.execute({});

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{dictionary.admin.scenariosTitle}</h1>
        <Button render={<Link href={`/${locale}/admin/scenarios/new`} />} nativeButton={false}>
          {dictionary.admin.newScenario}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dictionary.admin.form.title}</TableHead>
            <TableHead>{dictionary.admin.form.jlptLevel}</TableHead>
            <TableHead>{dictionary.admin.published}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarios.map((scenario) => (
            <TableRow key={scenario.id.toString()}>
              <TableCell className="font-medium">{scenario.title}</TableCell>
              <TableCell>{scenario.jlptLevel.toString()}</TableCell>
              <TableCell>
                <Badge variant={scenario.isPublished ? "default" : "secondary"}>
                  {scenario.isPublished ? dictionary.admin.published : dictionary.admin.draft}
                </Badge>
              </TableCell>
              <TableCell>
                <ScenarioRowActions
                  locale={locale}
                  scenarioId={scenario.id.toString()}
                  isPublished={scenario.isPublished}
                  dictionary={dictionary}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
