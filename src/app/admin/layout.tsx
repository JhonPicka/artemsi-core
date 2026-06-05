import type { ReactNode } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand/brand-mark";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireAdminUser();

  return (
    <main className="page-shell page-shell--wide">
      <header className="top-nav">
        <BrandMark href="/admin" label="ARTEMSI Admin" />

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
