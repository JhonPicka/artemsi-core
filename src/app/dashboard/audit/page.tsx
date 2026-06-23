import { AuditCalendar } from "@/components/audit/audit-calendar";
import { ProUpgradeCard } from "@/components/billing/pro-upgrade-card";
import { requireUser } from "@/lib/auth";
import { userHasProAccess } from "@/lib/billing";
import { AUDIT_AVAILABILITY_LABEL, generateAuditDays } from "@/lib/audit-slots";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirme",
  declined: "Refuse",
  cancelled: "Annule",
};

export default async function DashboardAuditPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const isPro = await userHasProAccess(user);

  const nowISO = new Date().toISOString();

  const [bookingsRes, takenRes] = await Promise.all([
    supabase
      .from("audit_bookings")
      .select("id, slot_start, slot_end, status, user_notes, admin_notes")
      .eq("user_id", user.id)
      .order("slot_start", { ascending: false }),
    isPro
      ? supabase
          .from("audit_bookings")
          .select("slot_start")
          .gte("slot_start", nowISO)
          .in("status", ["pending", "confirmed"])
      : Promise.resolve({ data: [], error: null }),
  ]);

  const bookings = bookingsRes.data ?? [];
  const takenStarts = new Set(
    (takenRes.data ?? []).map((row) => new Date(row.slot_start).toISOString()),
  );

  const days = isPro ? generateAuditDays({ takenStarts, daysAhead: 7 }) : [];

  return (
    <>
      <section className="card audit-intro">
        <span className="brand-chip">AUDIT</span>
        <h2>Audit / CV / lettre de motivation</h2>
        <p className="audit-intro-summary">
          Un humain ARTEMSI relit ton CV et ta lettre avec toi, verifie qu&apos;ils collent a ton
          objectif alternance, et te dit quoi ajuster en priorite — echange reel, pas un score auto.
        </p>
        {isPro ? (
          <p className="muted audit-intro-practical">
            Reserve un creneau ci-dessous. Disponibilites : {AUDIT_AVAILABILITY_LABEL}.
            Une fois ta demande envoyee, tu recevras une
            notification apres validation.
          </p>
        ) : (
          <p className="muted audit-intro-practical">
            L&apos;audit humain CV / lettre est réservé aux abonnés Pro. Passe Pro pour réserver un
            créneau avec l&apos;équipe ARTEMSI.
          </p>
        )}
      </section>

      {isPro ? (
        <section className="card">
          <h3>Choisir un creneau</h3>
          <AuditCalendar days={days} />
        </section>
      ) : (
        <ProUpgradeCard
          title="Audit CV réservé aux abonnés Pro"
          description="Un échange humain pour adapter ton CV et ta lettre à ton objectif alternance — disponible avec l'abonnement Pro."
        />
      )}

      <section className="card">
        <h3>Mes reservations</h3>
        {bookings.length === 0 ? (
          <p className="muted">Aucune reservation pour le moment.</p>
        ) : (
          <ul className="list">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <strong>
                  {new Date(booking.slot_start).toLocaleString("fr-FR", {
                    timeZone: "Europe/Paris",
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </strong>
                {" - "}
                <span className={`audit-status status-${booking.status}`}>
                  {STATUS_LABEL[booking.status] ?? booking.status}
                </span>
                {booking.user_notes ? (
                  <span className="muted"> — {booking.user_notes}</span>
                ) : null}
                {booking.admin_notes ? (
                  <p className="audit-admin-feedback">
                    <strong>Compte rendu ARTEMSI :</strong> {booking.admin_notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
