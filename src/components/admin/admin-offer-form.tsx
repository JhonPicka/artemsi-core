"use client";

import { useState } from "react";

import {
  guideTipsToText,
  textToApplicationGuide,
  type OfferApplicationGuide,
} from "@/lib/offer-application-guide";

type ExtractedFields = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  contractHint: string | null;
  applicationGuide?: OfferApplicationGuide | null;
};

type PublishResult = {
  offerId?: string;
  matching?: {
    matchedPairs: number;
    insertedAssignments: number;
    profilesConsidered: number;
  };
};

export function AdminOfferForm() {
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [tips, setTips] = useState("");
  const [source, setSource] = useState<"partner" | "autre">("partner");
  const [isPublic, setIsPublic] = useState(true);
  const [isExclusive, setIsExclusive] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<PublishResult | null>(null);

  async function handleExtract() {
    setError(null);
    setInfo(null);
    setPublished(null);

    if (!url.trim()) {
      setError("Indique l'URL de l'offre.");
      return;
    }

    setExtracting(true);
    try {
      const response = await fetch("/api/admin/offers/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          pastedText: pastedText.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Extraction impossible.");
        return;
      }

      const fields = data.fields as ExtractedFields;
      setTitle(fields.title ?? "");
      setCompany(fields.company ?? "");
      setLocation(fields.location ?? "");
      setDescription(fields.description ?? "");
      setTips(guideTipsToText(fields.applicationGuide ?? null));

      const hints: string[] = [];
      if (data.rawSource) hints.push(`Source analysee : ${data.rawSource}.`);
      if (data.fetchWarning) hints.push(data.fetchWarning);
      if (data.usedAi) hints.push("Analyse IA appliquee — raccourci candidat genere.");
      if (fields.contractHint) hints.push(`Contrat detecte : ${fields.contractHint}.`);
      setInfo(
        hints.length
          ? hints.join(" ")
          : "Champs pre-remplis — verifie le raccourci candidat avant publication.",
      );
    } catch {
      setError("Erreur reseau lors de l'analyse.");
    } finally {
      setExtracting(false);
    }
  }

  async function handlePublish() {
    setError(null);
    setInfo(null);
    setPublished(null);

    if (!url.trim() || !title.trim() || description.trim().length < 20) {
      setError("URL, titre et description (20 caracteres min.) sont obligatoires.");
      return;
    }

    const applicationGuide = textToApplicationGuide(tips);

    setPublishing(true);
    try {
      const response = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          company: company.trim() || null,
          location: location.trim() || null,
          description: description.trim(),
          source,
          isPublic,
          isPartnerExclusive: isExclusive,
          applicationGuide,
          runMatching: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Publication impossible.");
        return;
      }

      setPublished({
        offerId: data.offerId,
        matching: data.matching,
      });
      setInfo("Offre publiee. Le matching a ete lance pour les profils eligibles.");
    } catch {
      setError("Erreur reseau lors de la publication.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="admin-offer-form-block">
      <section className="card form admin-offer-step">
        <h2>Offre partenaire — publication unitaire</h2>
        <p className="muted admin-offer-lead">
          Pour les offres partenaires ou exclusives ARTEMSI : analyse IA, raccourci candidat et
          options de visibilité avancées.
        </p>
      </section>

      <section className="card form admin-offer-step">
        <h2>1. URL de l&apos;offre</h2>
        <p className="muted admin-offer-lead">
          Colle en priorité le lien officiel de l&apos;annonce (site carrières entreprise, page
          recrutement ou école partenaire). Si la page est bloquee, copie le texte de l&apos;annonce
          dans le champ ci-dessous — recommandé pour un raccourci candidat de qualité.
        </p>
        <label htmlFor="offer-url">URL</label>
        <input
          id="offer-url"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <label htmlFor="offer-paste">Texte de l&apos;annonce (fortement recommandé)</label>
        <textarea
          id="offer-paste"
          rows={6}
          placeholder="Colle ici le contenu si le lien ne se charge pas..."
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
        />
        <div className="form-actions">
          <button
            type="button"
            className="button-link"
            onClick={handleExtract}
            disabled={extracting}
          >
            {extracting ? "Analyse en cours…" : "Analyser l'offre"}
          </button>
        </div>
      </section>

      <section className="card form admin-offer-step">
        <h2>2. Fiche offre</h2>
        <label htmlFor="offer-title">Titre</label>
        <input id="offer-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="offer-company">Entreprise</label>
        <input id="offer-company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <label htmlFor="offer-location">Lieu</label>
        <input id="offer-location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <label htmlFor="offer-description">Description</label>
        <textarea
          id="offer-description"
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      <section className="card form admin-offer-step">
        <h2>3. Raccourci candidat</h2>
        <p className="muted admin-offer-lead">
          3 à 5 points max, affichés au candidat dans « Voir l&apos;offre ». Une ligne = un point.
          L&apos;IA pré-remplit — relis et raccourcis si besoin.
        </p>
        <label htmlFor="guide-tips">L&apos;essentiel pour ce poste</label>
        <textarea
          id="guide-tips"
          rows={5}
          placeholder={"Ex. :\nMets en avant Excel et la gestion de projet sur ton CV\nBac+3 commerce minimum\nDémarrage septembre 2026 — Lyon"}
          value={tips}
          onChange={(e) => setTips(e.target.value)}
        />
        <p className="muted small-label">
          Profil clé, compétences à reprendre, info pratique (lieu, début, rythme). Pas de questions
          d&apos;entretien.
        </p>
      </section>

      <section className="card form admin-offer-step">
        <h2>4. Publier</h2>
        <label htmlFor="offer-source">Source</label>
        <select
          id="offer-source"
          value={source}
          onChange={(e) => setSource(e.target.value as "partner" | "autre")}
        >
          <option value="partner">Partenaire</option>
          <option value="autre">Autre</option>
        </select>
        <label className="admin-offer-check">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Visible dans le pool public d&apos;offres
        </label>
        <label className="admin-offer-check">
          <input
            type="checkbox"
            checked={isExclusive}
            onChange={(e) => setIsExclusive(e.target.checked)}
          />
          Offre exclusive ARTEMSI
        </label>
        <div className="form-actions">
          <button
            type="button"
            className="button-link"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Publication…" : "Publier et lancer le matching"}
          </button>
        </div>
      </section>

      {info ? (
        <p className="admin-offer-info" role="status">
          {info}
        </p>
      ) : null}
      {error ? (
        <p className="error admin-offer-error" role="alert">
          {error}
        </p>
      ) : null}
      {published?.offerId ? (
        <section className="card admin-offer-success" role="status" aria-live="polite">
          <div className="admin-offer-success-head">
            <span className="admin-offer-success-icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <h3>Offre publiée avec succès</h3>
              <p className="muted">
                ID : <code>{published.offerId}</code>
              </p>
            </div>
          </div>
          <div className="admin-offer-success-checks" aria-label="Statut de publication">
            <span>✓ Enregistrée en base</span>
            <span>✓ Matching lancé</span>
          </div>
          {published.matching ? (
            <div className="admin-offer-matching-summary">
              <div>
                <strong>{published.matching.insertedAssignments}</strong>
                <span>assignation(s) créée(s)</span>
              </div>
              <div>
                <strong>{published.matching.matchedPairs}</strong>
                <span>match(s) trouvé(s)</span>
              </div>
              <div>
                <strong>{published.matching.profilesConsidered}</strong>
                <span>profil(s) analysé(s)</span>
              </div>
            </div>
          ) : (
            <p className="muted">
              L&apos;offre est publiée. Aucun détail de matching n&apos;a été retourné par l&apos;API.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
