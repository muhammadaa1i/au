"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface AppNavLink {
  href: string;
  label: string;
}

export function AppNav({ links }: { links: AppNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-sm sm:flex">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              isActive && "font-medium text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
