"use client";

import Link from "next/link";
import { useState } from "react";

import type { OfferMatchingResult } from "@/lib/run-offer-matching";

type Props = {
  recentOfferCount?: number;
};

export function AdminOfferMatchingPanel({ recentOfferCount }: Props) {
  const [running, setRunning] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OfferMatchingResult | null>(null);

  async function handleRun() {
    setError(null);
    setResult(null);
    setRunning(true);

    try {
      const response = await fetch("/api/admin/offers/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Matching impossible.");
        return;
      }
      setResult(data.matching as OfferMatchingResult);
    } catch {
      setError("Erreur réseau lors du matching.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="admin-offer-form-block">
      <section className="card form admin-offer-step">
        <h2>Lancer le matching</h2>
        <p className="muted admin-offer-lead">
          Associe les offres récentes (60 derniers jours, non masquées) aux profils candidats
          complets. Le matching n&apos;est plus automatique à la publication — lance-le quand tu es
          prêt.
          {recentOfferCount != null ? (
            <>
              {" "}
              <strong>{recentOfferCount}</strong> offre(s) en base au total.
            </>
          ) : null}
        </p>

        <label className="admin-offer-check">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
          />
          Simulation (dry run) — compte les matchs sans créer d&apos;assignations
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="button-link"
            onClick={handleRun}
            disabled={running}
          >
            {running
              ? "Matching en cours…"
              : dryRun
                ? "Simuler le matching"
                : "Lancer le matching"}
          </button>
        </div>
      </section>

      {error ? (
        <p className="error admin-offer-error" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <section className="card admin-offer-success" role="status" aria-live="polite">
          <div className="admin-offer-success-head">
            <span className="admin-offer-success-icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <h3>{result.dryRun ? "Simulation terminée" : "Matching terminé"}</h3>
              <p className="muted">
                {result.offersMatchedAgainst} offre(s) analysée(s) · {result.profilesConsidered}{" "}
                profil(s) éligible(s)
              </p>
            </div>
          </div>
          <div className="admin-offer-matching-summary">
            <div>
              <strong>{result.matchedPairs}</strong>
              <span>match(s) trouvé(s)</span>
            </div>
            <div>
              <strong>{result.insertedAssignments}</strong>
              <span>assignation(s) créée(s)</span>
            </div>
            <div>
              <strong>{result.insertedNotifications}</strong>
              <span>notification(s)</span>
            </div>
          </div>
          {!result.dryRun && result.insertedAssignments > 0 ? (
            <p className="muted small-label">
              Les candidats concernés verront les offres sur leur tableau de bord.
            </p>
          ) : null}
        </section>
      ) : null}

      <p className="muted small-label">
        Après avoir publié une offre, tu peux aussi lancer le matching depuis la page{" "}
        <Link href="/admin/offres/nouvelle" className="admin-inline-link">
          Nouvelle offre
        </Link>{" "}
        (bouton dédié une fois l&apos;offre enregistrée).
      </p>
    </div>
  );
}
