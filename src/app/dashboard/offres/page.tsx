import Link from "next/link";

import { FreemiumProUpgradeBanner } from "@/components/billing/freemium-pro-upgrade-banner";
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
import { offerFromAssignmentEmbed, type AssignmentEmbedRow } from "@/lib/offers-demo-preview";
import { prioritizeItemsWithExternalLinkOffers } from "@/lib/offer-external-link";
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

  const visiblePersonalAssignments = sliceVisiblePersonalAssignments(
    prioritizeItemsWithExternalLinkOffers(personalAssignments, (row) => row.offer),
    isPro,
  );
  const hiddenPersonalCount = hasHiddenPersonalAssignments(personalAssignments.length, isPro)
    ? personalAssignments.length - FREE_TIER_ASSIGNMENT_CAP
    : 0;

  const exclusiveAssignments = prioritizeItemsWithExternalLinkOffers(
    assignments
      .filter((row) => row.offer && row.offer.is_partner_exclusive)
      .map((row) => ({ status: row.status, offer: row.offer! })),
    (row) => row.offer,
  );

  const tabCounts = {
    personal: visiblePersonalAssignments.length,
    exclusive: exclusiveAssignments.length,
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

      {!isPro ? (
        <FreemiumProUpgradeBanner
          variant={
            view === "partenaires"
              ? "partners"
              : view === "jobboard"
                ? "jobboard"
                : "matching"
          }
          className="offers-page-pro-banner"
        />
      ) : null}

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
          {hiddenPersonalCount > 0 ? (
            <FreemiumProUpgradeBanner
              variant="hidden-offers"
              hiddenCount={hiddenPersonalCount}
            />
          ) : null}

          {assignmentsRes.error ? (
            <p className="error">Erreur perso : {assignmentsRes.error.message}</p>
          ) : visiblePersonalAssignments.length === 0 ? (
            <p className="muted offers-empty-hint">
              Aucune offre personnalisée pour le moment. Explore le{" "}
              <Link href="/dashboard/offres?view=jobboard">jobboard</Link> et marque des offres en
              intérêt pour affiner ton profil — les propositions arrivent ensuite ici.
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
          {assignmentsRes.error ? (
            <p className="error">Erreur offres partenaires : {assignmentsRes.error.message}</p>
          ) : exclusiveAssignments.length === 0 ? (
            <p className="muted offers-empty-hint">
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
          <p className="muted">
            Parcours les offres de la communauté. Clique sur <strong>Ça m'intéresse</strong> pour
            recevoir plus d&apos;offres similaires dans <em>Pour toi</em>.
          </p>

          {jobboardRes.error ? (
            <p className="error">Erreur offres publiques : {jobboardRes.error.message}</p>
          ) : allJobboard.length === 0 ? (
            <p className="muted offers-empty-hint">
              Le catalogue est en cours d&apos;alimentation. Reviens sous peu pour parcourir les
              offres disponibles.
            </p>
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
