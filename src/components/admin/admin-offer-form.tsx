"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import {
  guideTipsToText,
  textToApplicationGuide,
} from "@/lib/offer-application-guide";
import {
  STUDY_DOMAINS,
  STUDY_DOMAIN_LABEL,
  type StudyDomain,
} from "@/lib/constants";
import type { OfferMatchingResult } from "@/lib/run-offer-matching";

type InputMode = "scan" | "manual";

type ExtractedFields = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  contractHint: string | null;
  studyDomain: StudyDomain | null;
};

type PublishResult = {
  offerId?: string;
  matching?: OfferMatchingResult | null;
};

const INITIAL_STUDY_DOMAIN: StudyDomain = "AUTRE";

type AdminOfferFormProps = {
  initialStudyDomain?: StudyDomain;
};

export function AdminOfferForm({ initialStudyDomain }: AdminOfferFormProps = {}) {
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [inputMode, setInputMode] = useState<InputMode>("scan");
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [studyDomain, setStudyDomain] = useState<StudyDomain>(
    initialStudyDomain ?? INITIAL_STUDY_DOMAIN,
  );
  const [tips, setTips] = useState("");
  const [source, setSource] = useState<"partner" | "autre">("partner");
  const [isPublic, setIsPublic] = useState(true);
  const [isExclusive, setIsExclusive] = useState(false);
  const [runMatchingOnPublish, setRunMatchingOnPublish] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastPublished, setLastPublished] = useState<PublishResult | null>(null);

  const isPartnerOffer = source === "partner" || isExclusive;

  function resetFormFields() {
    setUrl("");
    setPastedText("");
    setTitle("");
    setCompany("");
    setLocation("");
    setDescription("");
    setStudyDomain(INITIAL_STUDY_DOMAIN);
    setTips("");
    window.requestAnimationFrame(() => {
      urlInputRef.current?.focus();
      urlInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function buildPublishSuccessMessage(
    offerId: string,
    matching: OfferMatchingResult | null | undefined,
  ) {
    if (matching) {
      return `Offre publiée (${matching.insertedAssignments} assignation(s), ${matching.matchedPairs} match(s)). Formulaire vidé — tu peux enchaîner.`;
    }
    return `Offre publiée (ID ${offerId.slice(0, 8)}…). Formulaire vidé — colle la prochaine offre.`;
  }

  async function handleExtract() {
    setError(null);
    setInfo(null);
    setLastPublished(null);

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
      if (fields.studyDomain) setStudyDomain(fields.studyDomain);

      const hints: string[] = [];
      if (data.rawSource) hints.push(`Source analysée : ${data.rawSource}.`);
      if (data.fetchWarning) hints.push(data.fetchWarning);
      if (data.usedAi) hints.push("Analyse IA : faits extraits (sans conseils candidat).");
      if (data.extractMode) hints.push(`Mode : ${data.extractMode}.`);
      if (fields.contractHint) hints.push(`Contrat détecté : ${fields.contractHint}.`);
      if (fields.studyDomain) hints.push(`Domaine suggéré : ${STUDY_DOMAIN_LABEL[fields.studyDomain]}.`);
      setInfo(
        hints.length
          ? hints.join(" ")
          : "Fiche pré-remplie — relis les faits avant publication.",
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
    setLastPublished(null);

    if (!url.trim() || !title.trim() || description.trim().length < 20) {
      setError("URL, titre et description (20 caracteres min.) sont obligatoires.");
      return;
    }

    const applicationGuide = isPartnerOffer ? textToApplicationGuide(tips) : null;

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
          studyDomain,
          source,
          isPublic,
          isPartnerExclusive: isExclusive,
          applicationGuide,
          runMatching: runMatchingOnPublish,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Publication impossible.");
        return;
      }

      const publishedOfferId = data.offerId as string;
      const matching = data.matching as OfferMatchingResult | null | undefined;

      setLastPublished({ offerId: publishedOfferId, matching: matching ?? null });
      setInfo(buildPublishSuccessMessage(publishedOfferId, matching));
      resetFormFields();
    } catch {
      setError("Erreur reseau lors de la publication.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="admin-offer-form-block">
      <section className="card form admin-offer-step">
        <h2>Mode de saisie</h2>
        <div className="admin-offer-mode-tabs" role="tablist" aria-label="Mode de saisie">
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === "scan"}
            className={
              inputMode === "scan"
                ? "admin-offer-mode-tab is-active"
                : "admin-offer-mode-tab"
            }
            onClick={() => setInputMode("scan")}
          >
            Analyser URL + texte
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === "manual"}
            className={
              inputMode === "manual"
                ? "admin-offer-mode-tab is-active"
                : "admin-offer-mode-tab"
            }
            onClick={() => setInputMode("manual")}
          >
            Saisie manuelle
          </button>
        </div>
        <p className="muted admin-offer-lead">
          {inputMode === "scan" ? (
            <>
              Colle l&apos;URL et le texte de l&apos;annonce : l&apos;IA extrait titre, entreprise,
              lieu et description (faits uniquement).
            </>
          ) : (
            <>
              Remplis directement les champs ci-dessous — pratique quand tu as déjà les infos sous
              la main (copier-coller depuis un mail, un PDF, etc.).
            </>
          )}
        </p>
      </section>

      {inputMode === "scan" ? (
        <section className="card form admin-offer-step">
          <h2>1. URL et texte de l&apos;annonce</h2>
          <p className="muted admin-offer-lead">
            Lien officiel (site carrières). Copie aussi le texte de l&apos;annonce — indispensable
            si la page est chargée de menus (HelloWork, etc.).
          </p>
          <label htmlFor="offer-url">URL</label>
          <input
            id="offer-url"
            ref={urlInputRef}
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <label htmlFor="offer-paste">Texte de l&apos;annonce (fortement recommandé)</label>
          <textarea
            id="offer-paste"
            rows={6}
            placeholder="Colle ici le contenu de l'annonce…"
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
      ) : (
        <section className="card form admin-offer-step">
          <h2>1. Lien de l&apos;offre</h2>
          <p className="muted admin-offer-lead">
            L&apos;URL reste obligatoire (évite les doublons). Tu peux coller le lien de
            candidature ou la page carrières.
          </p>
          <label htmlFor="offer-url-manual">URL</label>
          <input
            id="offer-url-manual"
            ref={urlInputRef}
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </section>
      )}

      <section className="card form admin-offer-step">
        <h2>{inputMode === "scan" ? "2" : "2"}. Fiche offre</h2>
        <label htmlFor="offer-title">Titre</label>
        <input id="offer-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="offer-company">Entreprise</label>
        <input id="offer-company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <label htmlFor="offer-location">Lieu</label>
        <input id="offer-location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <label htmlFor="offer-domain">Domaine</label>
        <select
          id="offer-domain"
          value={studyDomain}
          onChange={(e) => setStudyDomain(e.target.value as StudyDomain)}
        >
          {STUDY_DOMAINS.map((domain) => (
            <option key={domain} value={domain}>
              {STUDY_DOMAIN_LABEL[domain]}
            </option>
          ))}
        </select>
        <label htmlFor="offer-description">Description</label>
        <textarea
          id="offer-description"
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      {isPartnerOffer ? (
        <section className="card form admin-offer-step">
          <h2>3. Raccourci candidat (partenaire)</h2>
          <p className="muted admin-offer-lead">
            Réservé aux offres partenaires : 3 à 5 conseils à saisir manuellement (une ligne =
            un point).
          </p>
          <label htmlFor="guide-tips">L&apos;essentiel pour ce poste</label>
          <textarea
            id="guide-tips"
            rows={5}
            placeholder={"Ex. :\nReprends Excel et la gestion de projet sur ton CV\nBac+3 commerce minimum\nDémarrage septembre 2026 — Lyon"}
            value={tips}
            onChange={(e) => setTips(e.target.value)}
          />
        </section>
      ) : null}

      <section className="card form admin-offer-step">
        <h2>{isPartnerOffer ? "4" : "3"}. Publier</h2>
        <label htmlFor="offer-source">Source</label>
        <select
          id="offer-source"
          value={source}
          onChange={(e) => {
            const next = e.target.value as "partner" | "autre";
            setSource(next);
            if (next === "autre") setTips("");
          }}
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
            onChange={(e) => {
              setIsExclusive(e.target.checked);
              if (!e.target.checked && source === "autre") setTips("");
            }}
          />
          Offre exclusive ARTEMSI
        </label>
        <label className="admin-offer-check">
          <input
            type="checkbox"
            checked={runMatchingOnPublish}
            onChange={(e) => setRunMatchingOnPublish(e.target.checked)}
          />
          Lancer le matching immédiatement après publication
        </label>
        <div className="form-actions">
          <button
            type="button"
            className="button-link"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Publication…" : "Publier l'offre"}
          </button>
        </div>
      </section>

      {info ? (
        <p className="admin-offer-info" role="status">
          {info}
          {lastPublished?.offerId ? (
            <>
              {" "}
              <Link
                href={`/admin/offres#admin-offer-${lastPublished.offerId}`}
                className="admin-inline-link"
              >
                Voir dans la liste
              </Link>
              {!lastPublished.matching ? (
                <>
                  {" "}
                  ·{" "}
                  <Link href="/admin/offres/matching" className="admin-inline-link">
                    Matching
                  </Link>
                </>
              ) : null}
            </>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p className="error admin-offer-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
