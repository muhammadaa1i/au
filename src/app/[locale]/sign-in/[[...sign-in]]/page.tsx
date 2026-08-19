import { SignIn } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignIn
        path={`/${locale}/sign-in`}
        signUpUrl={`/${locale}/sign-up`}
        forceRedirectUrl={`/${locale}/onboarding`}
      />
    </div>
  );
}
