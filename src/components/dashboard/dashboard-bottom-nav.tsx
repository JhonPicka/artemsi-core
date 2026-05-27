"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs: { href: string; label: string; icon: string }[] = [
  { href: "/dashboard", label: "Accueil", icon: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { href: "/dashboard/offres", label: "Offres", icon: "M4 7h16v3H4zM4 11h16v9H4zM9 4h6v3H9z" },
  { href: "/dashboard/candidatures", label: "Suivi", icon: "M5 4h14v4H5zM5 10h14v4H5zM5 16h14v4H5z" },
  { href: "/dashboard/audit", label: "Audit", icon: "M5 4h14v4H5zM7 10h10v2H7zM7 14h10v2H7zM7 18h6v2H7z" },
  { href: "/dashboard/profil", label: "Profil", icon: "M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.34 0-10 1.67-10 5v3h20v-3c0-3.33-6.66-5-10-5z" },
];

export function DashboardBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/dashboard" && pathname.startsWith(`${tab.href}/`));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-nav-item${isActive ? " active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={isActive ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={tab.icon} />
              </svg>
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
