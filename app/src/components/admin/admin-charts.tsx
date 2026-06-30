import type { ChartSlice, RankedItem } from "@/lib/admin-stats";

export function AdminProgressBar({
  label,
  value,
  max,
  hint,
  tone = "accent",
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
  tone?: "accent" | "success" | "warning";
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="admin-progress">
      <div className="admin-progress-head">
        <span className="admin-progress-label">{label}</span>
        <span className="admin-progress-value">
          {value}
          {max > 0 ? ` / ${max}` : ""} · {pct}%
        </span>
      </div>
      <div className="admin-progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`admin-progress-fill admin-progress-fill--${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint ? <p className="muted small-label admin-progress-hint">{hint}</p> : null}
    </div>
  );
}

function pieGradient(slices: ChartSlice[]) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return "conic-gradient(var(--border) 0 100%)";

  let cursor = 0;
  const stops: string[] = [];
  for (const slice of slices) {
    const pct = (slice.value / total) * 100;
    const end = cursor + pct;
    stops.push(`${slice.color} ${cursor}% ${end}%`);
    cursor = end;
  }
  return `conic-gradient(${stops.join(", ")})`;
}

export function AdminPieChart({
  title,
  slices,
  empty = "Pas de données",
}: {
  title: string;
  slices: ChartSlice[];
  empty?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);

  return (
    <section className="card admin-chart-card">
      <h3 className="admin-chart-card-title">{title}</h3>
      {total === 0 ? (
        <p className="muted small-label">{empty}</p>
      ) : (
        <div className="admin-pie-layout">
          <div
            className="admin-pie-ring"
            style={{ background: pieGradient(slices) }}
            aria-hidden
          >
            <div className="admin-pie-hole">
              <span className="admin-pie-total">{total}</span>
              <span className="admin-pie-total-label">total</span>
            </div>
          </div>
          <ul className="admin-pie-legend">
            {slices.map((slice) => {
              const pct = Math.round((slice.value / total) * 100);
              return (
                <li key={`${title}-${slice.label}`}>
                  <span className="admin-pie-dot" style={{ background: slice.color }} />
                  <span className="admin-pie-legend-label">{slice.label}</span>
                  <span className="admin-pie-legend-value">
                    {slice.value} ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

export function AdminFunnelSteps({
  steps,
}: {
  steps: { label: string; value: number; pct: number }[];
}) {
  const max = steps[0]?.value ?? 1;

  return (
    <section className="card admin-chart-card admin-funnel-card">
      <h3 className="admin-chart-card-title">Funnel produit</h3>
      <ol className="admin-funnel-steps">
        {steps.map((step) => (
          <li key={step.label} className="admin-funnel-step">
            <div className="admin-funnel-step-head">
              <span className="admin-funnel-step-label">{step.label}</span>
              <span className="admin-funnel-step-meta">
                {step.value} · {step.pct}%
              </span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill admin-progress-fill--accent"
                style={{ width: `${max > 0 ? (step.value / max) * 100 : 0}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AdminRankedBars({
  title,
  items,
  empty,
}: {
  title: string;
  items: RankedItem[];
  empty: string;
}) {
  const max = items[0]?.count ?? 0;

  return (
    <section className="card admin-chart-card">
      <h3 className="admin-chart-card-title">{title}</h3>
      {items.length === 0 ? (
        <p className="muted small-label">{empty}</p>
      ) : (
        <ul className="admin-ranked-bars">
          {items.map((item) => (
            <li key={`${title}-${item.label}`}>
              <div className="admin-ranked-bars-head">
                <span className="admin-ranked-label">{item.label}</span>
                <span className="admin-ranked-count">{item.count}</span>
              </div>
              <div className="admin-progress-track">
                <div
                  className="admin-progress-fill admin-progress-fill--accent"
                  style={{ width: max > 0 ? `${(item.count / max) * 100}%` : "0%" }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminVerticalBars({
  title,
  items,
  empty,
}: {
  title: string;
  items: RankedItem[];
  empty: string;
}) {
  const max = items[0]?.count ?? 1;

  return (
    <section className="card admin-chart-card">
      <h3 className="admin-chart-card-title">{title}</h3>
      {items.length === 0 ? (
        <p className="muted small-label">{empty}</p>
      ) : (
        <div className="dash-chart">
          <div className="dash-chart-bars admin-vertical-bars">
            {items.slice(0, 6).map((item) => {
              const h = max > 0 ? Math.max(8, (item.count / max) * 100) : 8;
              return (
                <div key={`${title}-${item.label}`} className="dash-chart-col">
                  <div className="dash-chart-bar" style={{ height: `${h}%` }} title={`${item.count}`} />
                  <div className="dash-chart-x">
                    <span className="dash-chart-xd">{item.count}</span>
                    <span className="dash-chart-xm">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
