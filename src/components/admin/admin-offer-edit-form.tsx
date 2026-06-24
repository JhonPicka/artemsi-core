"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  guideTipsToText,
  textToApplicationGuide,
} from "@/lib/offer-application-guide";
import { OFFER_DEAD_LINK_HIDE_THRESHOLD } from "@/lib/offer-link-reports";
import type { AdminOfferDetail } from "@/lib/admin-offers";

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
  const [isPublic, setIsPublic] = useState(offer.isPublic || Boolean(offer.hiddenAt));
  const [isExclusive, setIsExclusive] = useState(offer.isPartnerExclusive);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isHidden = Boolean(offer.hiddenAt);
  const urlChanged = url.trim() !== offer.url;

  async function handleSave() {
    setError(null);
    setInfo(null);

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
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Enregistrement impossible.");
        return;
      }

      setInfo(
        isHidden && urlChanged
          ? "Offre mise a jour. Le lien a ete corrige et l'offre est de nouveau visible."
          : "Offre mise a jour.",
      );
      router.push(`/admin/offres#admin-offer-${offer.id}`);
      router.refresh();
    } catch {
      setError("Erreur reseau lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer définitivement l'offre « ${offer.title} » ? Cette action est irréversible.`,
    );
    if (!confirmed) return;

    setError(null);
    setInfo(null);
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/offers/${offer.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Suppression impossible.");
        return;
      }
      router.push("/admin/offres");
      router.refresh();
    } catch {
      setError("Erreur reseau lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-offer-form-block">
      {isHidden ? (
        <section className="card admin-offer-alert" role="status">
          <h2>Offre masquée ({offer.linkReportCount} signalement(s))</h2>
          <p className="muted">
            Cette offre a été retirée du catalogue après {OFFER_DEAD_LINK_HIDE_THRESHOLD}{" "}
            signalements de lien mort. Corrige l&apos;URL ci-dessous puis enregistre pour la
            republier, ou supprime-la si elle n&apos;est plus valide.
          </p>
        </section>
      ) : offer.linkReportCount > 0 ? (
        <section className="card admin-offer-alert admin-offer-alert--warning" role="status">
          <h2>Signalements de lien mort</h2>
          <p className="muted">
            {offer.linkReportCount} signalement(s) reçu(s). L&apos;offre sera masquée
            automatiquement à {OFFER_DEAD_LINK_HIDE_THRESHOLD}.
          </p>
        </section>
      ) : null}

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

        <div className="form-actions">
          <button
            type="button"
            className="button-link"
            onClick={handleSave}
            disabled={saving || deleting}
          >
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </section>

      <section className="card form admin-offer-step admin-offer-danger-zone">
        <h2>Supprimer l&apos;offre</h2>
        <p className="muted admin-offer-lead">
          Retire définitivement l&apos;offre, ses assignations et ses signalements.
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="button-link danger-link"
            onClick={() => void handleDelete()}
            disabled={saving || deleting}
          >
            {deleting ? "Suppression…" : "Supprimer l'offre"}
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
    </div>
  );
}
