"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";

import type { DailyApplicationPoint } from "@/lib/dashboard-stats";

type Props = {
  series: DailyApplicationPoint[];
  monthLabel: string;
  isDemo: boolean;
};

type PlotPoint = {
  x: number;
  y: number;
  value: number;
  label: string;
  day: string;
};

const W = 720;
const H = 260;
const PAD = { top: 20, right: 20, bottom: 36, left: 44 };

function niceMax(raw: number): number {
  if (raw <= 0) return 4;
  if (raw <= 4) return 4;
  if (raw <= 6) return 6;
  if (raw <= 10) return 10;
  const step = raw <= 20 ? 2 : 5;
  return Math.ceil(raw / step) * step;
}

function maxValue(series: DailyApplicationPoint[]) {
  let max = 0;
  for (const d of series) {
    max = Math.max(max, d.sent, d.responses);
  }
  return niceMax(max);
}

function toPlotPoints(
  series: DailyApplicationPoint[],
  key: "sent" | "responses",
  innerW: number,
  innerH: number,
  max: number,
): PlotPoint[] {
  const n = series.length;
  if (n === 0) return [];
  const step = n > 1 ? innerW / (n - 1) : 0;
  return series.map((d, i) => ({
    x: PAD.left + (n > 1 ? i * step : innerW / 2),
    y: PAD.top + innerH - (d[key] / max) * innerH,
    value: d[key],
    label: d.label,
    day: d.day,
  }));
}

function buildSmoothPath(points: PlotPoint[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x} ${points[0].y}`;
  if (n === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function buildAreaPath(linePath: string, points: PlotPoint[], baselineY: number): string {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function pickXTickIndices(length: number): number[] {
  if (length <= 1) return [0];
  const picks = new Set<number>([0, length - 1]);
  const step = length > 20 ? 5 : length > 12 ? 4 : 3;
  for (let i = 0; i < length; i += step) picks.add(i);
  return [...picks].sort((a, b) => a - b);
}

export function ApplicationsMonthChart({ series, monthLabel, isDemo }: Props) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const baselineY = PAD.top + innerH;

  const max = useMemo(() => maxValue(series), [series]);
  const yTicks = useMemo(() => {
    const steps = max <= 4 ? [0, 2, 4] : max <= 6 ? [0, 3, 6] : [0, Math.round(max / 2), max];
    return [...new Set(steps)].sort((a, b) => a - b);
  }, [max]);

  const sentPoints = useMemo(
    () => toPlotPoints(series, "sent", innerW, innerH, max),
    [series, innerW, innerH, max],
  );
  const responsePoints = useMemo(
    () => toPlotPoints(series, "responses", innerW, innerH, max),
    [series, innerW, innerH, max],
  );

  const sentPath = useMemo(() => buildSmoothPath(sentPoints), [sentPoints]);
  const responsePath = useMemo(() => buildSmoothPath(responsePoints), [responsePoints]);
  const sentArea = useMemo(
    () => buildAreaPath(sentPath, sentPoints, baselineY),
    [sentPath, sentPoints, baselineY],
  );

  const xTickIndices = useMemo(() => pickXTickIndices(series.length), [series.length]);

  const totals = useMemo(
    () => ({
      sent: series.reduce((s, d) => s + d.sent, 0),
      responses: series.reduce((s, d) => s + d.responses, 0),
    }),
    [series],
  );

  const activeDay = activeIndex !== null ? series[activeIndex] : null;
  const guideX =
    activeIndex !== null && sentPoints[activeIndex] ? sentPoints[activeIndex].x : null;

  const resolveIndex = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg || series.length === 0) return null;
      const rect = svg.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const plotX = ratio * W;
      const t = (plotX - PAD.left) / innerW;
      const idx = Math.round(t * (series.length - 1));
      return Math.max(0, Math.min(series.length - 1, idx));
    },
    [series.length, innerW],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const idx = resolveIndex(event.clientX);
      setActiveIndex(idx);
    },
    [resolveIndex],
  );

  const onPointerLeave = useCallback(() => setActiveIndex(null), []);

  const tooltipLeftPct = useMemo(() => {
    if (activeIndex === null || series.length <= 1) return 50;
    const raw = (activeIndex / (series.length - 1)) * 100;
    return Math.min(90, Math.max(10, raw));
  }, [activeIndex, series.length]);

  return (
    <div className="app-chart">
      <div className="app-chart-head">
        <div className="app-chart-head-main">
          <p className="app-chart-kicker">Candidatures · mois en cours</p>
          <h3 className="app-chart-title">
            {monthLabel}
            {isDemo ? <span className="app-chart-demo">Exemple</span> : null}
          </h3>
        </div>
        <div className="app-chart-metrics" aria-label="Totaux du mois">
          <div className="app-chart-metric">
            <span className="app-chart-metric-value">{totals.sent}</span>
            <span className="app-chart-metric-label">Envoyées</span>
          </div>
          <div className="app-chart-metric app-chart-metric--success">
            <span className="app-chart-metric-value">{totals.responses}</span>
            <span className="app-chart-metric-label">Retours</span>
          </div>
        </div>
      </div>

      <ul className="app-chart-legend" aria-label="Légende">
        <li>
          <span className="app-chart-legend-dot app-chart-legend-dot--sent" aria-hidden />
          Envoyées
        </li>
        <li>
          <span className="app-chart-legend-dot app-chart-legend-dot--responses" aria-hidden />
          Retours &amp; entretiens
        </li>
      </ul>

      <div
        className="app-chart-stage"
        role="group"
        aria-label={
          isDemo
            ? `Graphique d'exemple pour ${monthLabel}`
            : `Évolution des candidatures pour ${monthLabel}`
        }
        onMouseLeave={onPointerLeave}
      >
        {activeDay ? (
          <div
            className="app-chart-tooltip"
            style={{ left: `${tooltipLeftPct}%` }}
            role="status"
          >
            <p className="app-chart-tooltip-date">{activeDay.label}</p>
            <p>
              <span className="app-chart-tooltip-dot app-chart-tooltip-dot--sent" />
              {activeDay.sent} envoyée{activeDay.sent > 1 ? "s" : ""}
            </p>
            <p>
              <span className="app-chart-tooltip-dot app-chart-tooltip-dot--responses" />
              {activeDay.responses} retour{activeDay.responses > 1 ? "s" : ""}
              {activeDay.responses > 0 ? " / entretien" : ""}
            </p>
          </div>
        ) : (
          <p className="app-chart-hint">Survole le graphique pour le détail jour par jour</p>
        )}

        <svg
          ref={svgRef}
          className="app-chart-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <defs>
            <linearGradient id={`${uid}-sent-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="85%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${uid}-sent-line`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--primary-2)" />
            </linearGradient>
            <filter id={`${uid}-glow-sent`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            className="app-chart-plot-bg"
            rx="10"
          />

          {yTicks.map((tick) => {
            const y = PAD.top + innerH - (tick / max) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  className="app-chart-grid"
                />
                <text x={PAD.left - 10} y={y + 4} className="app-chart-y">
                  {tick}
                </text>
              </g>
            );
          })}

          {sentArea ? (
            <path d={sentArea} fill={`url(#${uid}-sent-area)`} className="app-chart-area" />
          ) : null}

          <path
            d={responsePath}
            className="app-chart-line app-chart-line--responses"
            fill="none"
          />
          <path
            d={sentPath}
            className="app-chart-line app-chart-line--sent"
            fill="none"
            stroke={`url(#${uid}-sent-line)`}
            strokeWidth={3}
            filter={`url(#${uid}-glow-sent)`}
          />

          {guideX !== null ? (
            <line
              x1={guideX}
              y1={PAD.top}
              x2={guideX}
              y2={baselineY}
              className="app-chart-guide"
            />
          ) : null}

          {activeIndex !== null && sentPoints[activeIndex] ? (
            <>
              <circle
                cx={sentPoints[activeIndex].x}
                cy={sentPoints[activeIndex].y}
                r={5}
                className="app-chart-point app-chart-point--sent"
              />
              <circle
                cx={responsePoints[activeIndex]?.x ?? sentPoints[activeIndex].x}
                cy={responsePoints[activeIndex]?.y ?? baselineY}
                r={5}
                className="app-chart-point app-chart-point--responses"
              />
            </>
          ) : null}

          {xTickIndices.map((idx) => {
            const d = series[idx];
            const p = sentPoints[idx];
            if (!d || !p) return null;
            const dayNum = d.day.split("-")[2] ?? "";
            return (
              <text key={d.day} x={p.x} y={H - 10} className="app-chart-x">
                {dayNum}
              </text>
            );
          })}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            className="app-chart-hit"
          />
        </svg>
      </div>

      <p className="app-chart-foot muted">
        Retours et entretiens : date de mise à jour du statut dans tes candidatures.
      </p>
    </div>
  );
}
