import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/app/(auth)/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireAdminUser();

  return (
    <main className="page-shell page-shell--wide">
      <header className="top-nav">
        <Link href="/admin" className="brand-link" aria-label="Admin ARTEMSI">
          <Image
            src="/artemsi-logo.png"
            alt="Logo Artemsi"
            width={32}
            height={32}
            className="brand-logo"
            priority
          />
          <span className="brand-name">ARTEMSI Admin</span>
        </Link>

        <AdminNav />

        <form action={logoutAction} className="top-nav-logout">
          <button type="submit" className="logout-button">
            Deconnexion
          </button>
        </form>
      </header>

      {children}
    </main>
  );
}
