import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { AppNav } from "@/components/layout/app-nav";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireLearnerProfile } from "@/lib/auth/current-profile";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const profile = await requireLearnerProfile();

  const navLinks = [
    { href: `/${locale}/dashboard`, label: dictionary.nav.dashboard },
    { href: `/${locale}/scenarios`, label: dictionary.nav.scenarios },
    { href: `/${locale}/history`, label: dictionary.nav.history },
    ...(profile.isAdmin ? [{ href: `/${locale}/admin/scenarios`, label: dictionary.nav.admin }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-semibold">
          <GraduationCap className="size-5" />
          {dictionary.marketing.title}
        </Link>
        <AppNav links={navLinks} />
        <div className="flex items-center gap-3">
          <LocaleSwitcher currentLocale={locale} />
          <UserButton />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
