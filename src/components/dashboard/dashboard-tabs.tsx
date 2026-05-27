"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/dashboard/offres", label: "Offres" },
  { href: "/dashboard/candidatures", label: "Candidatures" },
  { href: "/dashboard/audit", label: "Audit" },
  { href: "/dashboard/profil", label: "Profil" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="tabs-nav" aria-label="Navigation dashboard">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/dashboard" && pathname.startsWith(`${tab.href}/`));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch
            className={`tab-link ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
