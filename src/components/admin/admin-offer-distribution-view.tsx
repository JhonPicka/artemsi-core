import Link from "next/link";

import { AdminAnalyticsLineChart } from "@/components/admin/admin-analytics-charts";
import type { OfferDistributionStats } from "@/lib/admin-offer-distribution";
import { profileDistributionCurve } from "@/lib/admin-offer-distribution";

type Props = {
  stats: OfferDistributionStats;
};

const MARGIN = { top: 28, right: 20, bottom: 44, left: 52 };

function DualDomainChart({ stats }: { stats: OfferDistributionStats }) {
  const width = 520;
  const height = 280;
  const margin = MARGIN;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const items = stats.rows.filter((row) => row.profileCount > 0 || row.offerCount > 0);
  const max = Math.max(
    ...items.flatMap((row) => [row.profileCount, row.offerCount]),
    1,
  );
  const groupW = items.length > 0 ? plotW / items.length : plotW;
  const barW = Math.min(14, groupW / 3);

  if (items.length === 0) {
    return <p className="muted admin-analytics-empty">Pas encore de profils ni d&apos;offres taguées.</p>;
  }

  return (
    <section className="card admin-analytics-chart">
      <header className="admin-analytics-chart-head">
        <h3>Profils vs offres par domaine</h3>
        <p className="admin-analytics-chart-axes">
          <span className="admin-offer-dist-legend">
            <span className="admin-offer-dist-swatch admin-offer-dist-swatch--profiles" />
            Profils
          </span>
          <span className="admin-offer-dist-legend">
            <span className="admin-offer-dist-swatch admin-offer-dist-swatch--offers" />
            Offres
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
                <text x={margin.left - 8} y={y + 4} className="admin-analytics-axis-label" textAnchor="end">
                  {Math.round(yVal)}
                </text>
              </g>
            );
          })}
          {items.map((item, index) => {
            const cx = margin.left + index * groupW + groupW / 2;
            const profileH = (item.profileCount / max) * plotH;
            const offerH = (item.offerCount / max) * plotH;
            const profileX = cx - barW - 2;
            const offerX = cx + 2;
            const shortLabel =
              item.label.length > 10 ? `${item.label.slice(0, 9)}…` : item.label;
            return (
              <g key={item.domain}>
                <rect
                  x={profileX}
                  y={margin.top + plotH - profileH}
                  width={barW}
                  height={Math.max(profileH, item.profileCount > 0 ? 2 : 0)}
                  fill="#7c5cff"
                  opacity={0.9}
                  rx={2}
                />
                <rect
                  x={offerX}
                  y={margin.top + plotH - offerH}
                  width={barW}
                  height={Math.max(offerH, item.offerCount > 0 ? 2 : 0)}
                  fill="#28d39a"
                  opacity={0.9}
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

export function AdminOfferDistributionView({ stats }: Props) {
  const curve = profileDistributionCurve(stats.rows);
  const curveItems = curve.map((point) => ({
    label: point.label.slice(0, 6),
    count: point.count,
  }));

  return (
    <div className="admin-offer-form-block">
      <section className="card admin-offer-step">
        <h2>Pilotage du catalogue</h2>
        <p className="muted admin-offer-lead">
          Le catalogue doit suivre la forme de ta base candidats : vise une majorité d&apos;offres
          dans les domaines où tu as le plus de profils.{" "}
          <strong>{stats.totalProfiles}</strong> profil(s) complet(s) ·{" "}
          <strong>{stats.totalOffers}</strong> offre(s) visible(s)
          {stats.unclassifiedOffers > 0 ? (
            <>
              {" "}
              · <strong>{stats.unclassifiedOffers}</strong> sans tag domaine
            </>
          ) : null}
          .
        </p>
      </section>

      {stats.priorities.length > 0 ? (
        <section className="card admin-offer-step admin-offer-dist-priorities">
          <h2>À enrichir en priorité</h2>
          <ul className="admin-offer-dist-priority-list">
            {stats.priorities.map((row) => (
              <li key={row.domain}>
                <strong>{row.label}</strong> — {row.profileCount} profil(s) ({row.profilePct}%) vs{" "}
                {row.offerCount} offre(s) ({row.offerPct}%) · écart{" "}
                <strong>+{row.gapPct} pts</strong>
              </li>
            ))}
          </ul>
          <p>
            <Link href="/admin/offres/nouvelle" className="button-link secondary-link">
              Ajouter une offre
            </Link>
          </p>
        </section>
      ) : null}

      <div className="admin-offer-dist-charts">
        <AdminAnalyticsLineChart
          title="Courbe de demande — profils par domaine"
          items={curveItems}
          yAxisLabel="Nombre de profils"
          xAxisLabel="Domaines (ordre catalogue)"
          empty="Aucun profil avec onboarding complété."
          color="#7c5cff"
        />
        <DualDomainChart stats={stats} />
      </div>

      <section className="card admin-offer-step">
        <h2>Détail par domaine</h2>
        <div className="admin-offers-table-wrap">
          <table className="admin-offers-table">
            <thead>
              <tr>
                <th scope="col">Domaine</th>
                <th scope="col">Profils</th>
                <th scope="col">Offres</th>
                <th scope="col">% profils</th>
                <th scope="col">% offres</th>
                <th scope="col">Écart</th>
              </tr>
            </thead>
            <tbody>
              {stats.rows.map((row) => (
                <tr key={row.domain}>
                  <td>{row.label}</td>
                  <td>{row.profileCount}</td>
                  <td>{row.offerCount}</td>
                  <td>{row.profilePct}%</td>
                  <td>{row.offerPct}%</td>
                  <td className={row.gapPct > 0 ? "admin-offer-dist-gap-positive" : undefined}>
                    {row.gapPct > 0 ? `+${row.gapPct}` : row.gapPct} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
