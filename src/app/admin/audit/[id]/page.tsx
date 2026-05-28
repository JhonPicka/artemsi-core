import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminAuditsPath, getAdminHomePath, isAdminUser } from "@/lib/admin-auth";
import { patchAdminAuditBooking } from "@/lib/admin-audit";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type AuditAdminPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; error?: string; success?: string }>;
};

export const dynamic = "force-dynamic";

async function submitAuditAction(formData: FormData) {
  "use server";

  const bookingId = String(formData.get("bookingId") ?? "");
  const token = String(formData.get("token") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!bookingId || !token || (action !== "confirm" && action !== "decline")) {
    redirect(`/admin/audit/${bookingId}?token=${encodeURIComponent(token)}&error=Action invalide`);
  }

  const user = await getCurrentUser();
  const result = await patchAdminAuditBooking(bookingId, { action }, {
    adminToken: token,
    asTrustedAdmin: isAdminUser(user),
  });

  const base = `/admin/audit/${bookingId}?token=${encodeURIComponent(token)}`;
  if (!result.ok) {
    redirect(`${base}&error=${encodeURIComponent(result.error)}`);
  }

  const message = action === "confirm" ? "Audit confirme avec succes." : "Audit refuse avec succes.";
  redirect(`${base}&success=${encodeURIComponent(message)}`);
}

export default async function AuditAdminPage({
  params,
  searchParams,
}: AuditAdminPageProps) {
  const { id } = await params;
  const { token, error, success } = await searchParams;
  const user = await getCurrentUser();

  if (isAdminUser(user) && !token) {
    redirect(getAdminAuditsPath());
  }

  if (!token) {
    if (isAdminUser(user)) {
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

  const slotLabel = new Date(booking.slot_start).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "full",
    timeStyle: "short",
  });

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

        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}

        <div className="form-actions">
          <form action={submitAuditAction}>
            <input type="hidden" name="bookingId" value={id} />
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="action" value="decline" />
            <button type="submit" className="button-link secondary-link">
              Refuser
            </button>
          </form>
          <form action={submitAuditAction}>
            <input type="hidden" name="bookingId" value={id} />
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="action" value="confirm" />
            <button type="submit" className="button-link">
              Confirmer
            </button>
          </form>
        </div>

        {isAdminUser(user) ? (
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
