import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminAuditsPath, getAdminHomePath, isAdminEmail } from "@/lib/admin-auth";
import { updateAuditBookingStatus } from "@/lib/admin-audit";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type AuditAdminPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; action?: string }>;
};

const ACTION_LABEL: Record<string, string> = {
  confirm: "Audit confirme",
  decline: "Audit refuse",
};

export const dynamic = "force-dynamic";

export default async function AuditAdminPage({
  params,
  searchParams,
}: AuditAdminPageProps) {
  const { id } = await params;
  const { token, action } = await searchParams;
  const user = await getCurrentUser();

  if (user?.email && isAdminEmail(user.email) && !action) {
    redirect(getAdminAuditsPath());
  }

  if (!token) {
    if (user?.email && isAdminEmail(user.email)) {
      redirect(getAdminAuditsPath());
    }
    notFound();
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return (
      <main className="centered-page">
        <section className="card form">
          <h1>Configuration manquante</h1>
          <p className="muted">
            Ajoute SUPABASE_SERVICE_ROLE_KEY dans .env.local.
          </p>
        </section>
      </main>
    );
  }

  const { data: booking } = await supabase
    .from("audit_bookings")
    .select("id, status, slot_start, admin_token, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!booking || booking.admin_token !== token) {
    notFound();
  }

  let resultMessage: string | null = null;
  let resultClass: "success" | "error" | null = null;

  if (action === "confirm" || action === "decline") {
    const result = await updateAuditBookingStatus(id, action, {
      adminToken: token,
      asTrustedAdmin: isAdminEmail(user?.email),
    });

    if (!result.ok) {
      resultMessage = result.error;
      resultClass = "error";
    } else {
      resultMessage = `${ACTION_LABEL[action]} avec succes.`;
      resultClass = "success";
      booking.status = result.status;
    }
  }

  const slotLabel = new Date(booking.slot_start).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "full",
    timeStyle: "short",
  });

  const baseConfirmHref = `?token=${encodeURIComponent(token)}&action=confirm`;
  const baseDeclineHref = `?token=${encodeURIComponent(token)}&action=decline`;

  return (
    <main className="centered-page">
      <section className="card form">
        <span className="brand-chip">ADMIN AUDIT</span>
        <h1>Demande de reservation</h1>
        <ul className="list">
          <li>
            <strong>Creneau :</strong> {slotLabel}
          </li>
          <li>
            <strong>Statut actuel :</strong> {booking.status}
          </li>
        </ul>

        {resultMessage ? (
          <p className={resultClass ?? "muted"}>{resultMessage}</p>
        ) : null}

        <div className="form-actions">
          <a className="button-link secondary-link" href={baseDeclineHref}>
            Refuser
          </a>
          <a className="button-link" href={baseConfirmHref}>
            Confirmer
          </a>
        </div>

        {user?.email && isAdminEmail(user.email) ? (
          <p className="muted small-label" style={{ marginTop: "1rem" }}>
            <Link href={getAdminAuditsPath()}>Retour aux audits</Link>
            {" · "}
            <Link href={getAdminHomePath()}>Tableau de bord</Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}
