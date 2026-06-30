import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand/brand-mark";
import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { isAdminUser } from "@/lib/admin-auth";
import { resolveAdminPostAuthPath } from "@/lib/admin-profile";
import { needsPasswordSetup } from "@/lib/auth-session";
import { requireActiveSubscription } from "@/lib/billing";
import { requireUser } from "@/lib/auth";
import { legalConfig } from "@/lib/legal-config";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await requireUser();
  if (isAdminUser(user)) {
    redirect(await resolveAdminPostAuthPath(user));
  }
  if (needsPasswordSetup(user)) {
    redirect("/signup/finish");
  }
  await requireActiveSubscription(user);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <main className="page-shell page-shell--wide">
      <header className="top-nav">
        <BrandMark href="/dashboard" />

        <DashboardTabs />

        <form action={logoutAction} className="top-nav-logout">
          <button type="submit" className="logout-button">
            Deconnexion
          </button>
        </form>
      </header>

      {children}

      <footer className="app-footer">
        <span>© {new Date().getFullYear()} ARTEMSI · Espace candidat alternance</span>
        <nav className="app-footer-links" aria-label="Liens légaux et support">
          <LegalFooterLinks />
          <a href={legalConfig.publicSiteUrl} target="_blank" rel="noopener noreferrer">
            {legalConfig.publicSiteLabel}
          </a>
          <a href={`mailto:${legalConfig.contactEmail}`}>Contact</a>
        </nav>
      </footer>

      <DashboardBottomNav />
    </main>
  );
}
