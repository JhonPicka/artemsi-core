"use client";

import { useCallback, useEffect, useState } from "react";

import { formatFrenchLongDate } from "@/lib/dates-fr";

type DailyDecision = {
  importDate: string;
  approved: boolean;
  decidedAt: string | null;
};

export function AdminLbaDailyDecision() {
  const [decision, setDecision] = useState<DailyDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDecision = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/offers/lba-import/decision");
      const data = (await response.json()) as { decision?: DailyDecision; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Impossible de charger le choix du jour.");
        return;
      }
      setDecision(data.decision ?? null);
    } catch {
      setError("Erreur reseau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDecision();
  }, [loadDecision]);

  async function saveDecision(approved: boolean) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/offers/lba-import/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      const data = (await response.json()) as { decision?: DailyDecision; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Enregistrement impossible.");
        return;
      }
      setDecision(data.decision ?? null);
    } catch {
      setError("Erreur reseau.");
    } finally {
      setSaving(false);
    }
  }

  const labelDate = decision?.importDate
    ? formatFrenchLongDate(decision.importDate)
    : "aujourd'hui";

  let statusText = "En attente de ton choix ce matin.";
  if (decision?.decidedAt) {
    statusText = decision.approved
      ? "Import automatique validé — le cron importera ce matin."
      : "Import automatique désactivé pour aujourd'hui.";
  }

  return (
    <section className="card form admin-offer-step admin-offer-lba-daily">
      <h2>Import automatique du matin</h2>
      <p className="muted admin-offer-lead">
        Chaque matin, choisis si le cron LBA doit importer les offres du jour (
        <strong>{labelDate}</strong>, heure Paris). L&apos;import manuel ci-dessous reste
        disponible à tout moment.
      </p>

      {loading ? <p className="muted">Chargement…</p> : null}

      {!loading && decision ? (
        <p className="admin-offer-lba-daily-status" role="status">
          {statusText}
        </p>
      ) : null}

      <div className="form-actions admin-offer-csv-actions">
        <button
          type="button"
          className="button-link"
          disabled={saving || loading}
          onClick={() => void saveDecision(true)}
        >
          {saving ? "Enregistrement…" : "Oui, importer ce matin"}
        </button>
        <button
          type="button"
          className="button-link secondary-link"
          disabled={saving || loading}
          onClick={() => void saveDecision(false)}
        >
          Non, pas aujourd&apos;hui
        </button>
      </div>

      {error ? (
        <p className="error admin-offer-error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="muted small-label">
        Cron Vercel : 5h UTC (~6h–7h Paris). Valide avant cette heure pour que l&apos;import parte
        automatiquement.
      </p>
    </section>
  );
}
