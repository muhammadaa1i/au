import { SignUp } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignUp
        path={`/${locale}/sign-up`}
        signInUrl={`/${locale}/sign-in`}
        forceRedirectUrl={`/${locale}/onboarding`}
      />
    </div>
  );
}
