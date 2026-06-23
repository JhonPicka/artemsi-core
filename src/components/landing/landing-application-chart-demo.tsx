"use client";

import { ApplicationsMonthChart } from "@/components/dashboard/applications-month-chart";
import {
  buildApplicationChartSeriesWithFakeOverlay,
  buildApplicationMonthSeries,
} from "@/lib/dashboard-stats";

const DEMO_SERIES = buildApplicationChartSeriesWithFakeOverlay(buildApplicationMonthSeries([]));

export function LandingApplicationChartDemo() {
  return (
    <div className="landing-chart-demo card">
      <ApplicationsMonthChart series={DEMO_SERIES} monthLabel="" isDemo landing />
    </div>
  );
}
