import Link from "next/link";

import { ActivityPageTracker } from "@/components/activity/activity-page-tracker";
import { FreemiumProUpgradeBanner } from "@/components/billing/freemium-pro-upgrade-banner";
import { JobboardOfferCard } from "@/components/offers/jobboard-offer-card";
import { JobboardPagination } from "@/components/offers/jobboard-pagination";
import { JobboardToolbar } from "@/components/offers/jobboard-toolbar";
import { OfferCard, type OfferCardData } from "@/components/offers/offer-card";
import { OffersViewTabs } from "@/components/offers/offers-view-tabs";
import { requireUser } from "@/lib/auth";
import { userHasProAccess } from "@/lib/billing";
import {
  mergeExclusiveOffersWithAssignments,
} from "@/lib/exclusive-offers-dashboard";
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
  parseOffersView,
} from "@/lib/offers-dashboard";
import { offerFromAssignmentEmbed, type AssignmentEmbedRow } from "@/lib/offers-demo-preview";
import { USER_ACTIVITY_EVENTS } from "@/lib/user-activity";
import { createClient } from "@/lib/supabase/server";

type OfferStatus = "sent" | "seen" | "applied" | "archived";

type AssignmentRow = {
  status: OfferStatus;
  assigned_at: string;
  offer: OfferCardData | null;
};

function buildVisibleJobboard(offers: OfferCardData[], isPro: boolean): OfferCardData[] {
  if (isPro || offers.length === 0) return offers;

  const exclusives = offers.filter((offer) => offer.is_partner_exclusive);
  const standard = offers.filter((offer) => !offer.is_partner_exclusive);
  const visibleStandard = sliceJobboardForFreeTier(standard);
  const visibleIds = new Set([
    ...exclusives.map((offer) => offer.id),
    ...visibleStandard.map((offer) => offer.id),
  ]);

  return offers.filter((offer) => visibleIds.has(offer.id));
}

type PageProps = {
  searchParams: Promise<{
    view?: string;
    page?: string;
    q?: string;
  }>;
};

const STATUS_LABEL: Record<OfferStatus, string> = {
  sent: "Nouveau",
  seen: "Vu",
  applied: "Postulée",
  archived: "Archivée",
};

export default async function DashboardOffersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = parseOffersView(params.view);
  const jobboardQuery = params.q?.trim() ?? "";
  const jobboardPage = parseJobboardPage(params.page);

  const user = await requireUser();
  const supabase = await createClient();
  const isPro = await userHasProAccess(user);

  const [jobboardRes, assignmentsRes, interestsRes, keywordsRes, exclusiveRes] =
    await Promise.all([
      supabase
        .from("offers")
        .select(
          "id, title, company, location, description, url, source, is_partner_exclusive, application_guide",
        )
        .or("is_public.eq.true,is_partner_exclusive.eq.true")
        .order("created_at", { ascending: false }),
      supabase
        .from("offer_assignments")
        .select(
          "status, assigned_at, offers (id, title, company, location, description, url, source, is_partner_exclusive, application_guide)",
        )
        .eq("user_id", user.id)
        .order("assigned_at", { ascending: false }),
      supabase.from("offer_interests").select("offer_id").eq("user_id", user.id),
      supabase
        .from("user_preferences")
        .select("interest_keywords")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("offers")
        .select(
          "id, title, company, location, description, url, source, is_partner_exclusive, application_guide",
        )
        .eq("is_partner_exclusive", true)
        .order("created_at", { ascending: false }),
    ]);

  const allJobboard = (jobboardRes.data ?? []) as OfferCardData[];
  const visibleJobboard = buildVisibleJobboard(allJobboard, isPro);
  const filteredJobboard = filterJobboardOffers(visibleJobboard, {
    q: jobboardQuery,
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

  const exclusiveOffers = (exclusiveRes.data ?? []) as OfferCardData[];
  const exclusiveAssignments = mergeExclusiveOffersWithAssignments(exclusiveOffers, assignments);

  const tabCounts = {
    personal: visiblePersonalAssignments.length,
    exclusive: exclusiveAssignments.length,
    jobboard: visibleJobboard.length,
  };

  return (
    <>
      <ActivityPageTracker eventType={USER_ACTIVITY_EVENTS.OFFERS_VIEW} />
      <div className="offers-page">
      <header className="offers-page-header">
        <div>
          <h1 className="offers-page-title">Offres</h1>
          <p className="muted offers-page-lead">
            Commence par tes offres ciblées et exclusives, puis explore le jobboard complet.
          </p>
        </div>
        <OffersViewTabs active={view} counts={tabCounts} />
      </header>

      {!isPro ? (
        <FreemiumProUpgradeBanner
          variant={
            view === "exclusives"
              ? "exclusives"
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
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {view === "exclusives" ? (
        <section className="offers-section offers-section--partner" aria-labelledby="offers-exclusive-title">
          <div className="offers-section-header">
            <h2 id="offers-exclusive-title">Offres exclusives ARTEMSI</h2>
          </div>
          <p className="muted">
            Notre catalogue d&apos;alternances partenaires ARTEMSI — avec guide candidat dédié.
            Toutes les offres exclusives, sans filtre de matching.
          </p>
          {exclusiveRes.error ? (
            <p className="error">Erreur offres exclusives : {exclusiveRes.error.message}</p>
          ) : exclusiveAssignments.length === 0 ? (
            <p className="muted offers-empty-hint">
              Pas encore d&apos;offre exclusive publiée. Reviens bientôt.
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
                  tag={<span className="offer-tag">Exclusive</span>}
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
            Parcours les offres de la communauté, y compris les exclusives ARTEMSI. Les offres
            exclusives sont visibles pour tous ; la candidature est réservée aux abonnés Pro.
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
                  />
                </>
              )}
            </>
          )}
        </section>
      ) : null}
    </div>
    </>
  );
}
