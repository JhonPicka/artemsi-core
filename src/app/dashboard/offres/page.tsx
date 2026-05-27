import { JobboardOfferCard } from "@/components/offers/jobboard-offer-card";
import { OfferCard, type OfferCardData } from "@/components/offers/offer-card";
import { requireUser } from "@/lib/auth";
import {
  DEMO_EXCLUSIVE_ASSIGNMENTS,
  DEMO_JOBBOARD,
  DEMO_PERSONAL_ASSIGNMENTS,
  offerFromAssignmentEmbed,
  type AssignmentEmbedRow,
} from "@/lib/offers-demo-preview";
import { createClient } from "@/lib/supabase/server";

type OfferStatus = "sent" | "seen" | "applied" | "archived";

type AssignmentRow = {
  status: OfferStatus;
  assigned_at: string;
  offer: OfferCardData | null;
};

const STATUS_LABEL: Record<OfferStatus, string> = {
  sent: "Nouveau",
  seen: "Vu",
  applied: "Postulée",
  archived: "Archivée",
};

const SOURCE_LABEL: Record<OfferCardData["source"], string> = {
  indeed: "Source externe",
  partner: "Partenaire",
  autre: "Autre",
};

function DemoBanner({ long }: { long?: boolean }) {
  return (
    <p className="offers-demo-banner">
      {long
        ? "Exemples d'affichage — offres fictives. Tes vraies propositions apparaîtront ici dès qu'elles seront disponibles."
        : "Aperçu fictif — les cartes ci-dessous ne sont pas de vraies offres."}
    </p>
  );
}

export default async function DashboardOffersPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [jobboardRes, assignmentsRes, interestsRes, keywordsRes] = await Promise.all([
    supabase
      .from("offers")
      .select("id, title, company, location, description, url, source, is_partner_exclusive, keywords")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(48),
    supabase
      .from("offer_assignments")
      .select("status, assigned_at, offers (id, title, company, location, description, url, source, is_partner_exclusive, keywords)")
      .eq("user_id", user.id)
      .order("assigned_at", { ascending: false }),
    supabase.from("offer_interests").select("offer_id").eq("user_id", user.id),
    supabase
      .from("user_preferences")
      .select("interest_keywords")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const jobboard = (jobboardRes.data ?? []) as OfferCardData[];
  const interestedIds = new Set(
    (interestsRes.data ?? []).map((row) => row.offer_id as string),
  );
  const interestKeywords = (keywordsRes.data?.interest_keywords as string[] | null) ?? [];

  const rawAssignments = (assignmentsRes.data ?? []) as AssignmentEmbedRow[];
  const assignments: AssignmentRow[] = rawAssignments.map((row) => ({
    status: row.status,
    assigned_at: row.assigned_at,
    offer: offerFromAssignmentEmbed(row),
  }));

  const personalAssignments = assignments
    .filter((row) => row.offer && !row.offer.is_partner_exclusive)
    .map((row) => ({ status: row.status, offer: row.offer! }));

  const exclusiveAssignments = assignments
    .filter((row) => row.offer && row.offer.is_partner_exclusive)
    .map((row) => ({ status: row.status, offer: row.offer! }));

  const showPersonalDemo = personalAssignments.length === 0;
  const showExclusiveDemo = exclusiveAssignments.length === 0;
  const showJobboardDemo = jobboard.length === 0;

  const firstDemoSection: "personal" | "exclusive" | "jobboard" | null = !assignmentsRes.error
    ? showPersonalDemo
      ? "personal"
      : showExclusiveDemo
        ? "exclusive"
        : null
    : null;
  const firstDemoWithJobboard: "personal" | "exclusive" | "jobboard" | null =
    firstDemoSection ?? (!jobboardRes.error && showJobboardDemo ? "jobboard" : null);

  return (
    <>
      <section className="offers-section offers-section--jobboard">
        <div className="offers-section-header">
          <h2>Offres publiques sélectionnées</h2>
        </div>
        <p className="muted">
          Parcours les offres de la communauté. Clique sur <strong>Ça m&apos;intéresse</strong> pour
          les ajouter à ton profil : ARTEMSI t&apos;enverra plus d&apos;offres similaires dans{" "}
          <em>Pour toi</em>.
          {interestKeywords.length > 0 ? (
            <>
              {" "}
              Tes centres d&apos;intérêt actuels :{" "}
              {interestKeywords.slice(0, 6).join(", ")}
              {interestKeywords.length > 6 ? "…" : ""}.
            </>
          ) : null}
        </p>

        {jobboardRes.error ? (
          <p className="error">Erreur offres publiques : {jobboardRes.error.message}</p>
        ) : showJobboardDemo ? (
          <>
            <DemoBanner long={firstDemoWithJobboard === "jobboard"} />
            <div className="offers-grid">
              {DEMO_JOBBOARD.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  tag={<span className="offer-tag muted-tag">{SOURCE_LABEL[offer.source]}</span>}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="offers-grid">
            {jobboard.map((offer) => (
              <JobboardOfferCard
                key={offer.id}
                offer={offer}
                initialInterested={interestedIds.has(offer.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="offers-section">
        <div className="offers-section-header">
          <h2>Pour toi</h2>
        </div>
        <p className="muted">
          Offres envoyées automatiquement selon ton profil et tes centres d&apos;intérêt.
        </p>

        {assignmentsRes.error ? (
          <p className="error">Erreur perso : {assignmentsRes.error.message}</p>
        ) : showPersonalDemo ? (
          <>
            <DemoBanner long={firstDemoWithJobboard === "personal"} />
            <div className="offers-grid">
              {DEMO_PERSONAL_ASSIGNMENTS.map(({ status, offer }) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  badge={
                    <span className={`offer-status status-${status}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  }
                  tag={<span className="offer-tag muted-tag">{SOURCE_LABEL[offer.source]}</span>}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="offers-grid">
            {personalAssignments.map(({ status, offer }) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                badge={
                  <span className={`offer-status status-${status}`}>
                    {STATUS_LABEL[status]}
                  </span>
                }
                tag={<span className="offer-tag muted-tag">{SOURCE_LABEL[offer.source]}</span>}
              />
            ))}
          </div>
        )}
      </section>

      <section className="offers-section">
        <div className="offers-section-header">
          <h2>Offres partenaires ARTEMSI</h2>
        </div>
        <p className="muted">
          Offres mises en avant pour les candidats accompagnés par ARTEMSI, issues de sources
          partenaires ou validées manuellement.
        </p>

        {assignmentsRes.error ? (
          <p className="error">Erreur offres partenaires : {assignmentsRes.error.message}</p>
        ) : showExclusiveDemo ? (
          <>
            <DemoBanner long={firstDemoWithJobboard === "exclusive"} />
            <div className="offers-grid">
              {DEMO_EXCLUSIVE_ASSIGNMENTS.map(({ status, offer }) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  badge={
                    <span className={`offer-status status-${status}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  }
                  tag={<span className="offer-tag">Partenaire</span>}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="offers-grid">
            {exclusiveAssignments.map(({ status, offer }) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                badge={
                  <span className={`offer-status status-${status}`}>
                    {STATUS_LABEL[status]}
                  </span>
                }
                tag={<span className="offer-tag">Partenaire</span>}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
