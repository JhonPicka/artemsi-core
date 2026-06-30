import type { ReactNode } from "react";

import type { RankedItem } from "@/lib/admin-stats";

const DEFAULT_COLORS = [
  "#7c5cff",
  "#28d39a",
  "#5eb8ff",
  "#ffb547",
  "#ff7b9a",
  "#9aa3b2",
];

type ChartMargins = { top: number; right: number; bottom: number; left: number };

const MARGIN: ChartMargins = { top: 28, right: 20, bottom: 44, left: 52 };

function niceMax(value: number) {
  if (value <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function buildTicks(max: number, count = 4) {
  const ceiling = niceMax(max);
  const step = ceiling / count;
  return Array.from({ length: count + 1 }, (_, i) => Math.round(step * i));
}

function ChartShell({
  title,
  yAxisLabel,
  xAxisLabel,
  width = 480,
  height = 260,
  children,
}: {
  title: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  width?: number;
  height?: number;
  children: ReactNode;
}) {
  return (
    <section className="card admin-analytics-chart">
      <header className="admin-analytics-chart-head">
        <h3>{title}</h3>
        {yAxisLabel || xAxisLabel ? (
          <p className="admin-analytics-chart-axes">
            {yAxisLabel ? <span>Ordonnée : {yAxisLabel}</span> : null}
            {xAxisLabel ? <span>Abscisse : {xAxisLabel}</span> : null}
          </p>
        ) : null}
      </header>
      <div className="admin-analytics-chart-body">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="admin-analytics-svg"
          role="img"
          aria-label={title}
        >
          {children}
        </svg>
      </div>
    </section>
  );
}

function GridAndYAxis({
  width,
  height,
  max,
  margin = MARGIN,
}: {
  width: number;
  height: number;
  max: number;
  margin?: ChartMargins;
}) {
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const ticks = buildTicks(max);

  return (
    <>
      {ticks.map((tick) => {
        const y = margin.top + plotH - (tick / ticks[ticks.length - 1]) * plotH;
        return (
          <g key={tick}>
            <line
              x1={margin.left}
              y1={y}
              x2={width - margin.right}
              y2={y}
              className="admin-analytics-grid-line"
            />
            <text x={margin.left - 8} y={y + 4} className="admin-analytics-axis-label" textAnchor="end">
              {tick}
            </text>
          </g>
        );
      })}
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        className="admin-analytics-axis-line"
      />
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        className="admin-analytics-axis-line"
      />
    </>
  );
}

export function AdminAnalyticsBarChart({
  title,
  items,
  yAxisLabel = "Nombre",
  xAxisLabel = "Période",
  empty = "Pas de données",
  color = DEFAULT_COLORS[0],
}: {
  title: string;
  items: RankedItem[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  empty?: string;
  color?: string;
}) {
  const width = 480;
  const height = 260;
  const margin = MARGIN;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const max = Math.max(...items.map((i) => i.count), 0);
  const yMax = niceMax(max);
  const barGap = 8;
  const barW = items.length > 0 ? (plotW - barGap * (items.length - 1)) / items.length : plotW;

  if (items.length === 0) {
    return (
      <section className="card admin-analytics-chart">
        <h3 className="admin-analytics-chart-title-only">{title}</h3>
        <p className="muted admin-analytics-empty">{empty}</p>
      </section>
    );
  }

  return (
    <ChartShell title={title} yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} width={width} height={height}>
      <GridAndYAxis width={width} height={height} max={yMax} />
      {items.map((item, index) => {
        const h = yMax > 0 ? (item.count / yMax) * plotH : 0;
        const x = margin.left + index * (barW + barGap);
        const y = margin.top + plotH - h;
        return (
          <g key={`${title}-${item.label}`}>
            <rect
              x={x}
              y={y}
              width={Math.max(barW, 4)}
              height={Math.max(h, item.count > 0 ? 2 : 0)}
              fill={color}
              opacity={0.88}
              rx={2}
            />
            <text
              x={x + barW / 2}
              y={height - margin.bottom + 16}
              className="admin-analytics-axis-label admin-analytics-x-label"
              textAnchor="middle"
            >
              {item.label}
            </text>
            {item.count > 0 ? (
              <text x={x + barW / 2} y={y - 6} className="admin-analytics-value-label" textAnchor="middle">
                {item.count}
              </text>
            ) : null}
          </g>
        );
      })}
    </ChartShell>
  );
}

export function AdminAnalyticsLineChart({
  title,
  items,
  yAxisLabel = "Nombre",
  xAxisLabel = "Date",
  empty = "Pas de données",
  color = DEFAULT_COLORS[0],
}: {
  title: string;
  items: RankedItem[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  empty?: string;
  color?: string;
}) {
  const width = 480;
  const height = 260;
  const margin = MARGIN;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const max = Math.max(...items.map((i) => i.count), 0);
  const yMax = niceMax(max);

  if (items.length === 0) {
    return (
      <section className="card admin-analytics-chart">
        <h3 className="admin-analytics-chart-title-only">{title}</h3>
        <p className="muted admin-analytics-empty">{empty}</p>
      </section>
    );
  }

  const points = items.map((item, index) => {
    const x =
      items.length === 1
        ? margin.left + plotW / 2
        : margin.left + (index / (items.length - 1)) * plotW;
    const y = margin.top + plotH - (yMax > 0 ? (item.count / yMax) * plotH : 0);
    return { x, y, item };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <ChartShell title={title} yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} width={width} height={height}>
      <GridAndYAxis width={width} height={height} max={yMax} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.75} className="admin-analytics-line" />
      {points.map((p) => (
        <g key={`${title}-${p.item.label}`}>
          <circle cx={p.x} cy={p.y} r={3.5} fill={color} />
          <text
            x={p.x}
            y={height - margin.bottom + 16}
            className="admin-analytics-axis-label admin-analytics-x-label"
            textAnchor="middle"
          >
            {p.item.label}
          </text>
        </g>
      ))}
    </ChartShell>
  );
}

export function AdminAnalyticsHorizontalBarChart({
  title,
  items,
  xAxisLabel = "Effectif",
  yAxisLabel = "Catégorie",
  empty = "Pas de données",
}: {
  title: string;
  items: RankedItem[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  empty?: string;
}) {
  const width = 480;
  const rowH = 28;
  const margin = { top: 16, right: 24, bottom: 36, left: 120 };
  const height = margin.top + margin.bottom + Math.max(items.length, 1) * rowH;
  const max = Math.max(...items.map((i) => i.count), 0);
  const xMax = niceMax(max);
  const plotW = width - margin.left - margin.right;

  if (items.length === 0) {
    return (
      <section className="card admin-analytics-chart">
        <h3 className="admin-analytics-chart-title-only">{title}</h3>
        <p className="muted admin-analytics-empty">{empty}</p>
      </section>
    );
  }

  const ticks = buildTicks(xMax, 4);

  return (
    <ChartShell title={title} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} width={width} height={height}>
      {ticks.map((tick) => {
        const x = margin.left + (tick / ticks[ticks.length - 1]) * plotW;
        return (
          <g key={tick}>
            <line
              x1={x}
              y1={margin.top}
              x2={x}
              y2={height - margin.bottom}
              className="admin-analytics-grid-line"
            />
            <text x={x} y={height - 10} className="admin-analytics-axis-label" textAnchor="middle">
              {tick}
            </text>
          </g>
        );
      })}
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        className="admin-analytics-axis-line"
      />
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        className="admin-analytics-axis-line"
      />
      {items.map((item, index) => {
        const y = margin.top + index * rowH + 6;
        const w = xMax > 0 ? (item.count / xMax) * plotW : 0;
        const color = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        return (
          <g key={`${title}-${item.label}`}>
            <text x={margin.left - 8} y={y + 12} className="admin-analytics-axis-label" textAnchor="end">
              {item.label.length > 16 ? `${item.label.slice(0, 15)}…` : item.label}
            </text>
            <rect x={margin.left} y={y} width={Math.max(w, item.count > 0 ? 2 : 0)} height={16} fill={color} rx={2} />
            <text x={margin.left + w + 6} y={y + 12} className="admin-analytics-value-label">
              {item.count}
            </text>
          </g>
        );
      })}
    </ChartShell>
  );
}

export function AdminAnalyticsFunnelChart({
  title,
  steps,
}: {
  title: string;
  steps: { label: string; value: number; pct: number }[];
}) {
  const width = 480;
  const rowH = 36;
  const margin = { top: 20, right: 24, bottom: 20, left: 140 };
  const height = margin.top + margin.bottom + steps.length * rowH;
  const max = steps[0]?.value ?? 1;

  return (
    <ChartShell title={title} yAxisLabel="Étape" xAxisLabel="Volume (effectif)">
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        className="admin-analytics-axis-line"
      />
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        className="admin-analytics-axis-line"
      />
      {buildTicks(max, 4).map((tick) => {
        const plotW = width - margin.left - margin.right;
        const x = margin.left + (tick / niceMax(max)) * plotW;
        return (
          <line
            key={tick}
            x1={x}
            y1={margin.top}
            x2={x}
            y2={height - margin.bottom}
            className="admin-analytics-grid-line"
          />
        );
      })}
      {steps.map((step, index) => {
        const y = margin.top + index * rowH + 8;
        const plotW = width - margin.left - margin.right;
        const w = max > 0 ? (step.value / max) * plotW : 0;
        return (
          <g key={step.label}>
            <text x={margin.left - 8} y={y + 12} className="admin-analytics-axis-label" textAnchor="end">
              {step.label}
            </text>
            <rect x={margin.left} y={y} width={Math.max(w, step.value > 0 ? 2 : 0)} height={18} fill={DEFAULT_COLORS[0]} opacity={0.85} rx={2} />
            <text x={margin.left + w + 8} y={y + 13} className="admin-analytics-value-label">
              {step.value} ({step.pct.toLocaleString("fr-FR")} %)
            </text>
          </g>
        );
      })}
    </ChartShell>
  );
}

export function AdminAnalyticsDonutTable({
  title,
  items,
  empty = "Pas de données",
}: {
  title: string;
  items: RankedItem[];
  empty?: string;
}) {
  const total = items.reduce((s, i) => s + i.count, 0);

  if (total === 0) {
    return (
      <section className="card admin-analytics-chart">
        <h3 className="admin-analytics-chart-title-only">{title}</h3>
        <p className="muted admin-analytics-empty">{empty}</p>
      </section>
    );
  }

  return (
    <section className="card admin-analytics-chart">
      <header className="admin-analytics-chart-head">
        <h3>{title}</h3>
        <p className="admin-analytics-chart-axes">
          <span>Total : {total}</span>
        </p>
      </header>
      <table className="admin-analytics-table">
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Effectif</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${title}-${item.label}`}>
              <td>
                <span
                  className="admin-analytics-table-dot"
                  style={{ background: DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
                />
                {item.label}
              </td>
              <td>{item.count}</td>
              <td>{Math.round((item.count / total) * 1000) / 10} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
