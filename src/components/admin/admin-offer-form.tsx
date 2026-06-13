"use client";

import { useState } from "react";

import {
  formStateToApplicationGuide,
  guideToFormState,
  type ApplicationGuideFormState,
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

const EMPTY_GUIDE_FORM: ApplicationGuideFormState = {
  competencies: "",
  education: "",
  profile: "",
  keyFacts: "",
  letterAngles: "",
  typicalQuestions: "",
  questionsToAsk: "",
};

function GuideField({
  id,
  label,
  hint,
  value,
  onChange,
  rows = 4,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        placeholder="Une ligne = un point"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="muted small-label">{hint}</p>
    </>
  );
}

export function AdminOfferForm() {
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [guideForm, setGuideForm] = useState<ApplicationGuideFormState>(EMPTY_GUIDE_FORM);
  const [source, setSource] = useState<"partner" | "autre">("partner");
  const [isPublic, setIsPublic] = useState(true);
  const [isExclusive, setIsExclusive] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<PublishResult | null>(null);

  function updateGuideField<K extends keyof ApplicationGuideFormState>(
    key: K,
    value: ApplicationGuideFormState[K],
  ) {
    setGuideForm((prev) => ({ ...prev, [key]: value }));
  }

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
      setGuideForm(guideToFormState(fields.applicationGuide ?? null));

      const hints: string[] = [];
      if (data.rawSource) hints.push(`Source analysee : ${data.rawSource}.`);
      if (data.fetchWarning) hints.push(data.fetchWarning);
      if (data.usedAi) hints.push("Analyse IA appliquee — guide CV/LM genere.");
      if (fields.contractHint) hints.push(`Contrat detecte : ${fields.contractHint}.`);
      setInfo(
        hints.length
          ? hints.join(" ")
          : "Champs pre-remplis — verifie le guide candidat avant publication.",
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

    const applicationGuide = formStateToApplicationGuide(guideForm);

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
    <div className="admin-offer-panel">
      <section className="card form admin-offer-step">
        <h2>1. URL de l&apos;offre</h2>
        <p className="muted admin-offer-lead">
          Colle en priorité le lien officiel de l&apos;annonce (site carrières entreprise, page
          recrutement ou école partenaire). Si la page est bloquee, copie le texte de l&apos;annonce
          dans le champ ci-dessous — c&apos;est recommandé pour un guide CV/LM de qualité.
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
        <h2>3. Guide candidat (CV &amp; lettre)</h2>
        <p className="muted admin-offer-lead">
          Affiché au candidat dans « Voir l&apos;offre » — l&apos;IA pré-remplit ces blocs. Une ligne
          = un point. Relis et corrige avant publication.
        </p>
        <GuideField
          id="guide-competencies"
          label="Compétences à mettre en avant (CV)"
          hint="Outils, méthodes, compétences techniques cités dans l'annonce."
          value={guideForm.competencies}
          onChange={(v) => updateGuideField("competencies", v)}
        />
        <GuideField
          id="guide-education"
          label="Cursus & formation (CV)"
          hint="Niveau Bac+X, filière, diplôme ou type d'école attendu."
          value={guideForm.education}
          onChange={(v) => updateGuideField("education", v)}
        />
        <GuideField
          id="guide-profile"
          label="Profil recherché (CV)"
          hint="Soft skills, langues, expériences types demandées."
          value={guideForm.profile}
          onChange={(v) => updateGuideField("profile", v)}
        />
        <GuideField
          id="guide-keyfacts"
          label="Infos clés (dates, rythme, contrat…)"
          hint="Démarrage, durée, rythme alternance, lieu, télétravail, salaire si indiqué."
          value={guideForm.keyFacts}
          onChange={(v) => updateGuideField("keyFacts", v)}
        />
        <GuideField
          id="guide-letter"
          label="Angles pour la lettre de motivation"
          hint="Accroches pour expliquer pourquoi ce poste et cette entreprise."
          value={guideForm.letterAngles}
          onChange={(v) => updateGuideField("letterAngles", v)}
        />
        <GuideField
          id="guide-typical"
          label="Questions typiques en entretien"
          hint="Ce qu'un recruteur pose souvent pour ce type de poste."
          value={guideForm.typicalQuestions}
          onChange={(v) => updateGuideField("typicalQuestions", v)}
        />
        <GuideField
          id="guide-ask"
          label="Questions à poser au recruteur"
          hint="Pour montrer ta motivation et valider le poste."
          value={guideForm.questionsToAsk}
          onChange={(v) => updateGuideField("questionsToAsk", v)}
        />
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
