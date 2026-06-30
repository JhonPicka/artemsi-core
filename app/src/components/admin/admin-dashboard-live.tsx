"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  generatedAt: string;
  children: React.ReactNode;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AdminDashboardLive({ generatedAt, children }: Props) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState(generatedAt);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLastRefresh(generatedAt);
  }, [generatedAt]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRefreshing(true);
      router.refresh();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (refreshing) {
      const timeout = window.setTimeout(() => setRefreshing(false), 1200);
      return () => window.clearTimeout(timeout);
    }
  }, [refreshing, generatedAt]);

  function refreshNow() {
    setRefreshing(true);
    router.refresh();
  }

  return (
    <div className="admin-dashboard-live">
      <div className="admin-live-bar">
        <span className="admin-live-dot" aria-hidden="true" />
        <span>
          Temps réel — actualisation auto toutes les 30 s
          {refreshing ? " · mise à jour…" : ` · ${formatTime(lastRefresh)}`}
        </span>
        <button type="button" className="admin-live-refresh" onClick={refreshNow}>
          Actualiser
        </button>
      </div>
      {children}
    </div>
  );
}
