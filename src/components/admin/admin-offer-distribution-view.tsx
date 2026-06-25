import Link from "next/link";

import { AdminAnalyticsLineChart } from "@/components/admin/admin-analytics-charts";
import {
  buildAdminOffersHref,
  type AdminOffersListQuery,
} from "@/lib/admin-offers-query";
import type { DomainDistributionRow, OfferDistributionStats } from "@/lib/admin-offer-distribution";
import { profileDistributionCurve } from "@/lib/admin-offer-distribution";
import type { StudyDomain } from "@/lib/constants";

type Props = {
  stats: OfferDistributionStats;
};

const LIST_QUERY_BASE: AdminOffersListQuery = {
  page: 1,
  sort: "updated_desc",
  search: "",
  platform: "all",
  visibility: "all",
  source: "all",
  domain: "all",
};

function offersListHref(domain: AdminOffersListQuery["domain"]) {
  return buildAdminOffersHref(LIST_QUERY_BASE, { domain });
}

function newOfferHref(domain?: StudyDomain) {
  return domain ? `/admin/offres/nouvelle?domain=${domain}` : "/admin/offres/nouvelle";
}

const MARGIN = { top: 28, right: 20, bottom: 44, left: 52 };

function DualDomainChart({ stats }: { stats: OfferDistributionStats }) {
  const width = 520;
  const height = 280;
  const margin = MARGIN;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const items = stats.rows.filter((row) => row.profileCount > 0 || row.offerCount > 0);
  const max = Math.max(
    ...items.flatMap((row) => [row.offerCount, row.targetOfferCount, row.profileCount]),
    1,
  );
  const groupW = items.length > 0 ? plotW / items.length : plotW;
  const barW = Math.min(10, groupW / 4);

  if (items.length === 0) {
    return (
      <p className="muted admin-analytics-empty">
        Pas encore de profils. Passe par l&apos;onboarding candidats pour alimenter la courbe de
        demande.
      </p>
    );
  }

  return (
    <section className="card admin-analytics-chart">
      <header className="admin-analytics-chart-head">
        <h3>Ce que tu as vs ce qu&apos;il te faut</h3>
        <p className="admin-analytics-chart-axes">
          <span className="admin-offer-dist-legend">
            <span className="admin-offer-dist-swatch admin-offer-dist-swatch--profiles" />
            Profils (demande)
          </span>
          <span className="admin-offer-dist-legend">
            <span className="admin-offer-dist-swatch admin-offer-dist-swatch--offers" />
            Offres taguées
          </span>
          <span className="admin-offer-dist-legend">
            <span className="admin-offer-dist-swatch admin-offer-dist-swatch--target" />
            Cible offres
          </span>
        </p>
      </header>
      <div className="admin-analytics-chart-body">
        <svg viewBox={`0 0 ${width} ${height}`} className="admin-analytics-svg" role="img">
          {Array.from({ length: 5 }, (_, i) => {
            const yVal = (max / 4) * i;
            const y = margin.top + plotH - (yVal / max) * plotH;
            return (
              <g key={`grid-${i}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  className="admin-analytics-grid-line"
                />
                <text
                  x={margin.left - 8}
                  y={y + 4}
                  className="admin-analytics-axis-label"
                  textAnchor="end"
                >
                  {Math.round(yVal)}
                </text>
              </g>
            );
          })}
          {items.map((item, index) => {
            const cx = margin.left + index * groupW + groupW / 2;
            const profileH = (item.profileCount / max) * plotH;
            const offerH = (item.offerCount / max) * plotH;
            const targetH = (item.targetOfferCount / max) * plotH;
            const shortLabel =
              item.label.length > 9 ? `${item.label.slice(0, 8)}…` : item.label;
            return (
              <g key={item.domain}>
                <rect
                  x={cx - barW * 1.5 - 2}
                  y={margin.top + plotH - profileH}
                  width={barW}
                  height={Math.max(profileH, item.profileCount > 0 ? 2 : 0)}
                  fill="#7c5cff"
                  opacity={0.88}
                  rx={2}
                />
                <rect
                  x={cx - barW / 2}
                  y={margin.top + plotH - offerH}
                  width={barW}
                  height={Math.max(offerH, item.offerCount > 0 ? 2 : 0)}
                  fill="#28d39a"
                  opacity={0.9}
                  rx={2}
                />
                <rect
                  x={cx + barW / 2 + 2}
                  y={margin.top + plotH - targetH}
                  width={barW}
                  height={Math.max(targetH, item.targetOfferCount > 0 ? 2 : 0)}
                  fill="none"
                  stroke="#ffb547"
                  strokeWidth={2}
                  rx={2}
                />
                <text
                  x={cx}
                  y={height - margin.bottom + 14}
                  className="admin-analytics-axis-label admin-analytics-x-label"
                  textAnchor="middle"
                >
                  {shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

function PriorityActions({ row }: { row: DomainDistributionRow }) {
  return (
    <div className="admin-offer-dist-actions">
      <Link href={newOfferHref(row.domain)} className="admin-inline-link">
        + Ajouter
      </Link>
      <Link href={offersListHref(row.domain)} className="admin-inline-link">
        Voir offres
      </Link>
    </div>
  );
}

export function AdminOfferDistributionView({ stats }: Props) {
  const curve = profileDistributionCurve(stats.rows);
  const curveItems = curve
    .filter((point) => point.count > 0)
    .map((point) => ({
      label: point.label.slice(0, 6),
      count: point.count,
    }));

  const needsTagging = stats.unclassifiedOffers > 0;
  const readinessOk = stats.catalogReadinessPct >= 90 && stats.unclassifiedOffers === 0;

  return (
    <div className="admin-offer-form-block">
      <section
        className={`card admin-offer-step admin-offer-dist-health${readinessOk ? " admin-offer-dist-health--ok" : ""}`}
      >
        <h2>Santé du catalogue</h2>
        <div className="admin-offer-dist-kpis">
          <div>
            <strong>{stats.totalProfiles}</strong>
            <span>profils prêts à matcher</span>
          </div>
          <div>
            <strong>{stats.classifiedOffers}</strong>
            <span>offres taguées</span>
          </div>
          <div>
            <strong>{stats.catalogReadinessPct}%</strong>
            <span>catalogue prêt</span>
          </div>
          {needsTagging ? (
            <div className="admin-offer-dist-kpi-warn">
              <strong>{stats.unclassifiedOffers}</strong>
              <span>sans domaine</span>
            </div>
          ) : null}
        </div>
        <p className="muted admin-offer-lead">
          Objectif : que la répartition des offres <strong>suive celle des profils</strong>, pour
          que chaque candidat voie des postes dans son domaine. Commence par taguer l&apos;existant,
          puis comble les écarts domaine par domaine.
        </p>
      </section>

      <section className="card admin-offer-step admin-offer-dist-playbook">
        <h2>Plan d&apos;action (dans l&apos;ordre)</h2>
        <ol className="admin-offer-dist-playbook-list">
          <li>
            <strong>Taguer l&apos;existant</strong> — sans ça, les graphiques et le matching sont
            faux.{" "}
            {needsTagging ? (
              <Link href={offersListHref("missing")} className="admin-inline-link">
                {stats.unclassifiedOffers} offre(s) à classer →
              </Link>
            ) : (
              <span className="muted">✓ Toutes les offres visibles ont un domaine.</span>
            )}
          </li>
          <li>
            <strong>Combler les trous</strong> — domaines où tu as plus de profils que d&apos;offres
            (liste ci-dessous).{" "}
            <Link href={newOfferHref()} className="admin-inline-link">
              Publier une offre →
            </Link>
          </li>
          <li>
            <strong>Matcher quand tu es prêt</strong> — une fois le lot du jour publié.{" "}
            <Link href="/admin/offres/matching" className="admin-inline-link">
              Lancer le matching →
            </Link>
          </li>
        </ol>
      </section>

      {needsTagging && stats.unclassifiedSamples.length > 0 ? (
        <section className="card admin-offer-step admin-offer-dist-untagged">
          <h2>Offres à taguer en priorité</h2>
          <p className="muted admin-offer-lead">
            Ouvre chaque offre, choisis le <strong>domaine</strong> (même liste que les profils
            candidats), enregistre. Suggestion automatique basée sur le titre / description.
          </p>
          <div className="admin-offers-table-wrap">
            <table className="admin-offers-table">
              <thead>
                <tr>
                  <th scope="col">Titre</th>
                  <th scope="col">Entreprise</th>
                  <th scope="col">Suggestion</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.unclassifiedSamples.map((offer) => (
                  <tr key={offer.id}>
                    <td>
                      <span className="admin-offers-table-title">{offer.title}</span>
                      <span className="admin-offers-badge danger-badge">Sans domaine</span>
                    </td>
                    <td>{offer.company ?? "—"}</td>
                    <td>
                      {offer.suggestedLabel ? (
                        <>
                          {offer.suggestedLabel}
                          {offer.suggestedDomain ? (
                            <>
                              {" "}
                              <Link
                                href={`/admin/offres/${offer.id}`}
                                className="admin-inline-link muted small-label"
                              >
                                (appliquer)
                              </Link>
                            </>
                          ) : null}
                        </>
                      ) : (
                        <span className="muted">À définir à la main</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/offres/${offer.id}`} className="admin-inline-link">
                        Taguer →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stats.unclassifiedOffers > stats.unclassifiedSamples.length ? (
            <p className="muted small-label">
              <Link href={offersListHref("missing")} className="admin-inline-link">
                Voir les {stats.unclassifiedOffers} offres sans domaine
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {stats.priorities.length > 0 ? (
        <section className="card admin-offer-step admin-offer-dist-priorities">
          <h2>Ce que tes candidats veulent (et ce qui manque)</h2>
          <p className="muted admin-offer-lead">
            Trié par nombre d&apos;offres à ajouter pour coller à la demande réelle.
          </p>
          <div className="admin-offers-table-wrap">
            <table className="admin-offers-table">
              <thead>
                <tr>
                  <th scope="col">Domaine</th>
                  <th scope="col">Profils</th>
                  <th scope="col">Offres</th>
                  <th scope="col">Cible</th>
                  <th scope="col">À ajouter</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.priorities.map((row) => (
                  <tr key={row.domain}>
                    <td>
                      <strong>{row.label}</strong>
                      <span className="muted small-label">
                        {" "}
                        {row.profilePct}% des profils
                      </span>
                    </td>
                    <td>{row.profileCount}</td>
                    <td>{row.offerCount}</td>
                    <td>{row.targetOfferCount}</td>
                    <td className="admin-offer-dist-gap-positive">
                      {row.offersToAdd > 0 ? `+${row.offersToAdd}` : "—"}
                    </td>
                    <td>
                      <PriorityActions row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="card admin-offer-step">
          <h2>Équilibre domaines</h2>
          <p className="muted">
            Aucun écart majeur détecté — ou pas encore assez de profils / offres taguées pour
            calculer des priorités.
          </p>
        </section>
      )}

      <div className="admin-offer-dist-charts">
        <AdminAnalyticsLineChart
          title="Courbe de demande — où sont tes candidats"
          items={curveItems}
          yAxisLabel="Nombre de profils"
          xAxisLabel="Domaines"
          empty="Aucun profil avec onboarding complété."
          color="#7c5cff"
        />
        <DualDomainChart stats={stats} />
      </div>

      <section className="card admin-offer-step">
        <h2>Tableau complet</h2>
        <div className="admin-offers-table-wrap">
          <table className="admin-offers-table">
            <thead>
              <tr>
                <th scope="col">Domaine</th>
                <th scope="col">Profils</th>
                <th scope="col">Offres taguées</th>
                <th scope="col">Cible offres</th>
                <th scope="col">% profils</th>
                <th scope="col">% offres</th>
                <th scope="col">Écart</th>
                <th scope="col">Liens</th>
              </tr>
            </thead>
            <tbody>
              {stats.rows.map((row) => (
                <tr key={row.domain}>
                  <td>{row.label}</td>
                  <td>{row.profileCount}</td>
                  <td>{row.offerCount}</td>
                  <td>{row.targetOfferCount}</td>
                  <td>{row.profilePct}%</td>
                  <td>{row.offerPct}%</td>
                  <td className={row.gapPct > 0 ? "admin-offer-dist-gap-positive" : undefined}>
                    {row.gapPct > 0 ? `+${row.gapPct}` : row.gapPct} pts
                  </td>
                  <td>
                    <PriorityActions row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small-label">
          Raccourcis :{" "}
          <Link href="/admin/offres" className="admin-inline-link">
            Toutes les offres
          </Link>
          {" · "}
          <Link href={offersListHref("missing")} className="admin-inline-link">
            Sans domaine
          </Link>
          {" · "}
          <Link href="/admin/candidats" className="admin-inline-link">
            Voir candidats
          </Link>
          {" · "}
          <Link href="/admin/stats" className="admin-inline-link">
            Statistiques
          </Link>
        </p>
      </section>
    </div>
  );
}
