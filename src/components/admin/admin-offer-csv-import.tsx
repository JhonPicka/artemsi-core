"use client";

import { useRef, useState } from "react";

type ImportResult = {
  inserted?: number;
  skippedDuplicates?: number;
  issues?: Array<{ line: number; message: string }>;
  matching?: {
    matchedPairs: number;
    insertedAssignments: number;
    profilesConsidered: number;
  };
};

const CSV_TEMPLATE = `title,url,description,company,location,is_public
"Alternance Marketing Digital","https://exemple.com/offre/1","Alternance 12 mois en marketing digital, Bac+3/4, missions SEO et réseaux sociaux, début septembre.","Publicis","Lyon",true
"Alternance Data Analyst","https://exemple.com/offre/2","Alternance data Bac+4, Python/SQL, dashboards, équipe BI à Paris.","Capgemini","Paris",true`;

export function AdminOfferCsvImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "artemsi-offres-import.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    setError(null);
    setResult(null);
    setImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/offers/import", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ImportResult & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Import impossible.");
        if (data.issues?.length) {
          setResult({ issues: data.issues, inserted: data.inserted });
        }
        return;
      }

      setResult(data);
    } catch {
      setError("Erreur reseau lors de l'import.");
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="card form admin-offer-step admin-offer-csv">
      <h2>Import CSV — offres non partenaires</h2>
      <p className="muted admin-offer-lead">
        Pour les offres issues de sites carrières ou sources publiques (pas d&apos;offre exclusive
        partenaire). Chaque ligne est importée avec <strong>source = autre</strong> et{" "}
        <strong>non exclusive</strong>. Les offres partenaires / exclusives passent par le
        formulaire ci-dessous (analyse IA).
      </p>

      <p className="muted small-label">
        Colonnes obligatoires : <code>title</code>, <code>url</code>, <code>description</code>
        (min. 20 car.). Recommandées : <code>company</code>, <code>location</code>,{" "}
        <code>is_public</code> (true par défaut).
      </p>

      <div className="form-actions admin-offer-csv-actions">
        <button type="button" className="button-link secondary-link" onClick={downloadTemplate}>
          Télécharger un modèle CSV
        </button>
        <label className="button-link admin-offer-csv-file-label">
          {importing ? "Import en cours…" : "Choisir un fichier CSV"}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            disabled={importing}
            className="admin-offer-csv-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
            }}
          />
        </label>
      </div>

      {error ? (
        <p className="error admin-offer-error" role="alert">
          {error}
        </p>
      ) : null}

      {result?.inserted != null && result.inserted > 0 ? (
        <section className="card admin-offer-success" role="status" aria-live="polite">
          <div className="admin-offer-success-head">
            <span className="admin-offer-success-icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <h3>Import terminé</h3>
              <p className="muted">
                {result.inserted} offre(s) ajoutée(s)
                {result.skippedDuplicates
                  ? ` · ${result.skippedDuplicates} doublon(s) ignoré(s)`
                  : null}
              </p>
            </div>
          </div>
          {result.matching ? (
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

      {result?.issues && result.issues.length > 0 ? (
        <details className="admin-offer-csv-issues">
          <summary>
            {result.issues.length} avertissement(s) / ligne(s) ignorée(s)
          </summary>
          <ul className="admin-offer-csv-issues-list">
            {result.issues.slice(0, 30).map((issue) => (
              <li key={`${issue.line}-${issue.message}`}>
                Ligne {issue.line} : {issue.message}
              </li>
            ))}
            {result.issues.length > 30 ? (
              <li className="muted">… et {result.issues.length - 30} autre(s)</li>
            ) : null}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
