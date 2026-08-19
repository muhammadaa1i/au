import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireLearnerProfile } from "@/lib/auth/current-profile";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const profile = await requireLearnerProfile();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dictionary.onboarding.title}</CardTitle>
          <CardDescription>{dictionary.onboarding.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm
            dictionary={dictionary}
            defaultDisplayName={profile.displayName}
            defaultJlptLevel={profile.jlptLevel.toString()}
            defaultUiLanguage={profile.uiLanguage.toString()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
