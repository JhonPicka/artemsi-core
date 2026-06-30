"use client";

import { useState } from "react";

type LbaImportPayload = {
  profileScope: "admin" | "all";
  import: {
    configured: boolean;
    searchQueries: number;
    fetched: number;
    accepted: number;
    inserted: number;
    updated: number;
    skippedJobboard: number;
    skippedRecruteur: number;
    skippedPartner: number;
    skippedNoProfileMatch: number;
    profilesConsidered: number;
    errors: string[];
  };
  matching?: {
    matchedPairs: number;
    insertedAssignments: number;
    profilesConsidered: number;
  } | null;
};

export function AdminOfferLbaImport() {
  const [importing, setImporting] = useState(false);
  const [runMatching, setRunMatching] = useState(true);
  const [profileScope, setProfileScope] = useState<"admin" | "all">("admin");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LbaImportPayload | null>(null);

  async function handleImport() {
    setError(null);
    setResult(null);
    setImporting(true);

    try {
      const response = await fetch("/api/admin/offers/lba-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runMatching, profileScope }),
      });
      const data = (await response.json()) as LbaImportPayload & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Import LBA impossible.");
        return;
      }

      setResult(data);
    } catch {
      setError("Erreur reseau lors de l'import LBA.");
    } finally {
      setImporting(false);
    }
  }

  const importStats = result?.import;

  return (
    <section className="card form admin-offer-step admin-offer-lba">
      <h2>Import La Bonne Alternance</h2>
      <p className="muted admin-offer-lead">
        Récupère des offres via l&apos;API LBA et ne garde que celles qui{" "}
        <strong>correspondent à au moins un profil</strong> (domaine, région, poste) avec un lien
        vers un <strong>site carrière</strong> (France Travail, Indeed, HelloWork exclus).
      </p>

      <label className="admin-offer-check">
        <input
          type="radio"
          name="lba-profile-scope"
          checked={profileScope === "admin"}
          onChange={() => setProfileScope("admin")}
        />
        Basé sur <strong>mon profil admin</strong> (régions + domaine d&apos;étude)
      </label>

      <label className="admin-offer-check">
        <input
          type="radio"
          name="lba-profile-scope"
          checked={profileScope === "all"}
          onChange={() => setProfileScope("all")}
        />
        Basé sur <strong>tous les profils onboardés</strong>
      </label>

      <label className="admin-offer-check">
        <input
          type="checkbox"
          checked={runMatching}
          onChange={(e) => setRunMatching(e.target.checked)}
        />
        Lancer le matching après l&apos;import
      </label>

      <p className="muted small-label">
        Nécessite <code>LBA_API_TOKEN</code> en prod (jeton sur api.apprentissage.beta.gouv.fr).
      </p>

      <div className="form-actions admin-offer-csv-actions">
        <button
          type="button"
          className="button-link"
          disabled={importing}
          onClick={() => void handleImport()}
        >
          {importing ? "Import LBA en cours…" : "Lancer l'import LBA"}
        </button>
      </div>

      {error ? (
        <p className="error admin-offer-error" role="alert">
          {error}
        </p>
      ) : null}

      {importStats && (importStats.inserted > 0 || importStats.updated > 0) ? (
        <section className="card admin-offer-success" role="status" aria-live="polite">
          <div className="admin-offer-success-head">
            <span className="admin-offer-success-icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <h3>Import LBA terminé</h3>
              <p className="muted">
                {importStats.inserted} nouvelle(s) · {importStats.updated} mise(s) à jour ·{" "}
                {importStats.accepted} acceptée(s) sur {importStats.fetched} récupérée(s) ·{" "}
                {importStats.profilesConsidered} profil(s) analysé(s)
              </p>
            </div>
          </div>
          {result?.matching ? (
            <div className="admin-offer-matching-summary">
              <div>
                <strong>{result.matching.insertedAssignments}</strong>
                <span>assignation(s) créée(s)</span>
              </div>
              <div>
                <strong>{result.matching.matchedPairs}</strong>
                <span>match(s) trouvé(s)</span>
              </div>
              <div>
                <strong>{result.matching.profilesConsidered}</strong>
                <span>profil(s) analysé(s)</span>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {importStats && importStats.inserted === 0 && importStats.updated === 0 ? (
        <section className="card admin-offer-success" role="status" aria-live="polite">
          <h3>Import terminé — aucune nouvelle offre</h3>
          <p className="muted">
            {importStats.configured
              ? `${importStats.searchQueries} recherche(s) · ${importStats.skippedNoProfileMatch} hors profil(s) · ${importStats.skippedJobboard} jobboard(s) filtré(s).`
              : "LBA_API_TOKEN non configuré."}
          </p>
        </section>
      ) : null}

      {importStats?.errors && importStats.errors.length > 0 ? (
        <details className="admin-offer-csv-issues">
          <summary>{importStats.errors.length} message(s)</summary>
          <ul className="admin-offer-csv-issues-list">
            {importStats.errors.slice(0, 20).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
