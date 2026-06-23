import Link from "next/link";

import { JobboardOfferCard } from "@/components/offers/jobboard-offer-card";
import { JobboardPagination } from "@/components/offers/jobboard-pagination";
import { JobboardToolbar } from "@/components/offers/jobboard-toolbar";
import { OfferCard, type OfferCardData } from "@/components/offers/offer-card";
import { OffersViewTabs } from "@/components/offers/offers-view-tabs";
import { requireUser } from "@/lib/auth";
import { userHasProAccess } from "@/lib/billing";
import {
  FREE_TIER_ASSIGNMENT_CAP,
  hasHiddenPersonalAssignments,
  sliceJobboardForFreeTier,
  sliceVisiblePersonalAssignments,
} from "@/lib/freemium-access";
import {
  filterJobboardOffers,
  JOBBOARD_PAGE_SIZE,
  paginateOffers,
  parseJobboardPage,
  parseJobboardSource,
  parseOffersView,
} from "@/lib/offers-dashboard";
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

type PageProps = {
  searchParams: Promise<{
    view?: string;
    page?: string;
    q?: string;
    source?: string;
  }>;
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

function DemoBanner() {
  return (
    <p className="offers-demo-banner">
      Aperçu fictif — les cartes ci-dessous ne sont pas de vraies offres. Tes vraies propositions
      apparaîtront ici dès qu&apos;elles seront disponibles.
    </p>
  );
}

export default async function DashboardOffersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = parseOffersView(params.view);
  const jobboardQuery = params.q?.trim() ?? "";
  const jobboardSource = parseJobboardSource(params.source);
  const jobboardPage = parseJobboardPage(params.page);

  const user = await requireUser();
  const supabase = await createClient();
  const isPro = await userHasProAccess(user);

  const [jobboardRes, assignmentsRes, interestsRes, keywordsRes] = await Promise.all([
    supabase
      .from("offers")
      .select("id, title, company, location, description, url, source, is_partner_exclusive, application_guide")
      .eq("is_public", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("offer_assignments")
      .select("status, assigned_at, offers (id, title, company, location, description, url, source, is_partner_exclusive, application_guide)")
      .eq("user_id", user.id)
      .order("assigned_at", { ascending: false }),
    supabase.from("offer_interests").select("offer_id").eq("user_id", user.id),
    supabase
      .from("user_preferences")
      .select("interest_keywords")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const allJobboard = (jobboardRes.data ?? []) as OfferCardData[];
  const visibleJobboard = isPro ? allJobboard : sliceJobboardForFreeTier(allJobboard);
  const filteredJobboard = filterJobboardOffers(visibleJobboard, {
    q: jobboardQuery,
    source: jobboardSource,
  });
  const jobboardPageData = paginateOffers(filteredJobboard, jobboardPage, JOBBOARD_PAGE_SIZE);

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

  const visiblePersonalAssignments = sliceVisiblePersonalAssignments(personalAssignments, isPro);
  const hiddenPersonalCount = hasHiddenPersonalAssignments(personalAssignments.length, isPro)
    ? personalAssignments.length - FREE_TIER_ASSIGNMENT_CAP
    : 0;

  const exclusiveAssignments = assignments
    .filter((row) => row.offer && row.offer.is_partner_exclusive)
    .map((row) => ({ status: row.status, offer: row.offer! }));

  const showPersonalDemo = personalAssignments.length === 0;
  const showExclusiveDemo = exclusiveAssignments.length === 0;
  const showJobboardDemo = allJobboard.length === 0;

  const tabCounts = {
    personal: showPersonalDemo ? DEMO_PERSONAL_ASSIGNMENTS.length : visiblePersonalAssignments.length,
    exclusive: showExclusiveDemo ? DEMO_EXCLUSIVE_ASSIGNMENTS.length : exclusiveAssignments.length,
    jobboard: visibleJobboard.length,
  };

  return (
    <div className="offers-page">
      <header className="offers-page-header">
        <div>
          <h1 className="offers-page-title">Offres</h1>
          <p className="muted offers-page-lead">
            Commence par tes offres ciblées et partenaires, puis explore le jobboard complet.
          </p>
        </div>
        <OffersViewTabs active={view} counts={tabCounts} />
      </header>

      {view === "pour-moi" ? (
        <section className="offers-section" aria-labelledby="offers-pour-moi-title">
          <div className="offers-section-header">
            <h2 id="offers-pour-moi-title">Pour toi</h2>
          </div>
          <p className="muted">
            Offres envoyées automatiquement selon ton profil et tes centres d&apos;intérêt.
            {interestKeywords.length > 0 ? (
              <>
                {" "}
                Tes centres d&apos;intérêt : {interestKeywords.slice(0, 6).join(", ")}
                {interestKeywords.length > 6 ? "…" : ""}.
              </>
            ) : null}
          </p>
          {!isPro ? (
            <p className="offers-freemium-banner muted">
              Aperçu gratuit : <strong>{FREE_TIER_ASSIGNMENT_CAP} offres personnalisées</strong>{" "}
              maximum.{" "}
              <Link href="/subscribe">Passe Pro</Link> pour le matching complet sur ton profil.
            </p>
          ) : null}
          {hiddenPersonalCount > 0 ? (
            <p className="offers-freemium-banner muted">
              Encore <strong>{hiddenPersonalCount}</strong> offre
              {hiddenPersonalCount > 1 ? "s" : ""} te correspond
              {hiddenPersonalCount > 1 ? "ent" : ""} — <Link href="/subscribe">Passe Pro</Link>{" "}
              pour les voir.
            </p>
          ) : null}

          {assignmentsRes.error ? (
            <p className="error">Erreur perso : {assignmentsRes.error.message}</p>
          ) : showPersonalDemo ? (
            <>
              <DemoBanner />
              <div className="offers-grid">
                {DEMO_PERSONAL_ASSIGNMENTS.map(({ status, offer }) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    isPro={isPro}
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
          ) : visiblePersonalAssignments.length === 0 ? (
            <p className="muted">
              Aucune offre personnalisée pour le moment. Marque des offres en intérêt dans le{" "}
              <Link href="/dashboard/offres?view=jobboard">jobboard</Link> pour affiner ton profil.
            </p>
          ) : (
            <div className="offers-grid">
              {visiblePersonalAssignments.map(({ status, offer }) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isPro={isPro}
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
      ) : null}

      {view === "partenaires" ? (
        <section className="offers-section offers-section--partner" aria-labelledby="offers-partner-title">
          <div className="offers-section-header">
            <h2 id="offers-partner-title">Offres partenaires ARTEMSI</h2>
          </div>
          <p className="muted">
            Offres mises en avant pour les candidats accompagnés — sources partenaires ou validées
            manuellement.
          </p>
          {!isPro ? (
            <p className="offers-freemium-banner muted">
              En compte gratuit, tu peux consulter ces offres mais{" "}
              <strong>tu ne peux pas y candidater</strong>.{" "}
              <Link href="/subscribe">Passe Pro</Link> pour postuler.
            </p>
          ) : null}

          {assignmentsRes.error ? (
            <p className="error">Erreur offres partenaires : {assignmentsRes.error.message}</p>
          ) : showExclusiveDemo ? (
            <>
              <DemoBanner />
              <div className="offers-grid">
                {DEMO_EXCLUSIVE_ASSIGNMENTS.map(({ status, offer }) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    isPro={isPro}
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
          ) : exclusiveAssignments.length === 0 ? (
            <p className="muted">
              Pas encore d&apos;offre partenaire assignée. Les nouvelles propositions apparaîtront
              ici en priorité.
            </p>
          ) : (
            <div className="offers-grid">
              {exclusiveAssignments.map(({ status, offer }) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isPro={isPro}
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
      ) : null}

      {view === "jobboard" ? (
        <section className="offers-section offers-section--jobboard" aria-labelledby="offers-jobboard-title">
          <div className="offers-section-header">
            <h2 id="offers-jobboard-title">Jobboard public</h2>
          </div>
          {!isPro ? (
            <p className="offers-freemium-banner muted">
            Compte gratuit : tu vois <strong>50&nbsp;% du jobboard</strong> (les offres les moins
            récentes). Les <strong>dernières offres publiées</strong> sont réservées aux abonnés
            Pro.
            {" "}
            <Link href="/subscribe">Passe Pro</Link> pour le jobboard complet et l&apos;audit CV.
            </p>
          ) : null}
          <p className="muted">
            Parcours les offres de la communauté. Clique sur <strong>Ça m&apos;intéresse</strong> pour
            recevoir plus d&apos;offres similaires dans <em>Pour toi</em>.
          </p>

          {jobboardRes.error ? (
            <p className="error">Erreur offres publiques : {jobboardRes.error.message}</p>
          ) : showJobboardDemo ? (
            <>
              <DemoBanner />
              <div className="offers-grid">
                {DEMO_JOBBOARD.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    isPro={isPro}
                    tag={<span className="offer-tag muted-tag">{SOURCE_LABEL[offer.source]}</span>}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <JobboardToolbar
                q={jobboardQuery}
                source={jobboardSource}
                resultCount={filteredJobboard.length}
                totalCount={visibleJobboard.length}
              />

              {filteredJobboard.length === 0 ? (
                <p className="muted">
                  Aucune offre ne correspond à ta recherche.{" "}
                  <Link href="/dashboard/offres?view=jobboard">Réinitialiser les filtres</Link>.
                </p>
              ) : (
                <>
                  <div className="offers-grid">
                    {jobboardPageData.items.map((offer) => (
                      <JobboardOfferCard
                        key={offer.id}
                        offer={offer}
                        initialInterested={interestedIds.has(offer.id)}
                        isPro={isPro}
                      />
                    ))}
                  </div>
                  <JobboardPagination
                    page={jobboardPageData.page}
                    totalPages={jobboardPageData.totalPages}
                    q={jobboardQuery}
                    source={jobboardSource}
                  />
                </>
              )}
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
