import { MessageCircle, Mic, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function MarketingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const { userId } = await auth();
  const ctaHref = userId ? `/${locale}/dashboard` : `/${locale}/sign-up`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold">{dictionary.marketing.title}</span>
        <div className="flex items-center gap-2">
          <LocaleSwitcher currentLocale={locale} />
          {!userId && (
            <Button render={<Link href={`/${locale}/sign-in`} />} nativeButton={false} variant="ghost" size="sm">
              {dictionary.nav.signIn}
            </Button>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          {dictionary.marketing.title}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{dictionary.marketing.subtitle}</p>
        <Button render={<Link href={ctaHref} />} nativeButton={false} size="lg">
          {dictionary.marketing.cta}
        </Button>

        <div className="mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
          <FeatureCard icon={<MessageCircle className="size-6" />} text={dictionary.marketing.featureConversation} />
          <FeatureCard icon={<Mic className="size-6" />} text={dictionary.marketing.featureVoice} />
          <FeatureCard icon={<Sparkles className="size-6" />} text={dictionary.marketing.featureFeedback} />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border p-6">
      <div className="text-primary">{icon}</div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
