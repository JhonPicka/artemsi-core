"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  guideTipsToText,
  textToApplicationGuide,
} from "@/lib/offer-application-guide";
import type { AdminOfferDetail } from "@/lib/admin-offers";

type SaveResult = {
  matching?: {
    matchedPairs: number;
    insertedAssignments: number;
    profilesConsidered: number;
  };
};

type Props = {
  offer: AdminOfferDetail;
};

export function AdminOfferEditForm({ offer }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState(offer.url);
  const [title, setTitle] = useState(offer.title);
  const [company, setCompany] = useState(offer.company ?? "");
  const [location, setLocation] = useState(offer.location ?? "");
  const [description, setDescription] = useState(offer.description);
  const [tips, setTips] = useState(guideTipsToText(offer.applicationGuide));
  const [source, setSource] = useState<"partner" | "autre">(
    offer.source === "partner" ? "partner" : "autre",
  );
  const [isPublic, setIsPublic] = useState(offer.isPublic);
  const [isExclusive, setIsExclusive] = useState(offer.isPartnerExclusive);
  const [runMatching, setRunMatching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [saved, setSaved] = useState<SaveResult | null>(null);

  async function handleSave() {
    setError(null);
    setInfo(null);
    setSaved(null);

    if (!url.trim() || !title.trim() || description.trim().length < 20) {
      setError("URL, titre et description (20 caracteres min.) sont obligatoires.");
      return;
    }

    const applicationGuide = textToApplicationGuide(tips);

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/offers/${offer.id}`, {
        method: "PATCH",
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
          runMatching,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Enregistrement impossible.");
        return;
      }

      setSaved({ matching: data.matching });
      setInfo(
        runMatching
          ? "Offre mise a jour. Le matching a ete relance."
          : "Offre mise a jour.",
      );
      router.refresh();
    } catch {
      setError("Erreur reseau lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-offer-form-block">
      <section className="card form admin-offer-step">
        <h2>Fiche offre</h2>
        <p className="muted admin-offer-lead">
          ID <code>{offer.id}</code> · ajoutée le{" "}
          {new Date(offer.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <label htmlFor="edit-offer-url">URL</label>
        <input
          id="edit-offer-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <label htmlFor="edit-offer-title">Titre</label>
        <input
          id="edit-offer-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="edit-offer-company">Entreprise</label>
        <input
          id="edit-offer-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <label htmlFor="edit-offer-location">Lieu</label>
        <input
          id="edit-offer-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <label htmlFor="edit-offer-description">Description</label>
        <textarea
          id="edit-offer-description"
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      <section className="card form admin-offer-step">
        <h2>Raccourci candidat</h2>
        <p className="muted admin-offer-lead">
          3 à 5 points max, une ligne = un point. Laisse vide si non applicable (offres importées
          CSV).
        </p>
        <label htmlFor="edit-guide-tips">L&apos;essentiel pour ce poste</label>
        <textarea
          id="edit-guide-tips"
          rows={5}
          value={tips}
          onChange={(e) => setTips(e.target.value)}
        />
      </section>

      <section className="card form admin-offer-step">
        <h2>Visibilité & enregistrement</h2>
        <label htmlFor="edit-offer-source">Source</label>
        <select
          id="edit-offer-source"
          value={source}
          onChange={(e) => setSource(e.target.value as "partner" | "autre")}
        >
          <option value="partner">Partenaire</option>
          <option value="autre">Autre (non partenaire)</option>
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

        <label className="admin-offer-check">
          <input
            type="checkbox"
            checked={runMatching}
            onChange={(e) => setRunMatching(e.target.checked)}
          />
          Relancer le matching apres enregistrement
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="button-link"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
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
      {saved?.matching ? (
        <section className="card admin-offer-success" role="status">
          <div className="admin-offer-matching-summary">
            <div>
              <strong>{saved.matching.insertedAssignments}</strong>
              <span>assignation(s) créée(s)</span>
            </div>
            <div>
              <strong>{saved.matching.matchedPairs}</strong>
              <span>match(s) trouvé(s)</span>
            </div>
            <div>
              <strong>{saved.matching.profilesConsidered}</strong>
              <span>profil(s) analysé(s)</span>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
