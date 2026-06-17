"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { OfferApplicationGuideBlock } from "@/components/offers/offer-application-guide-block";
import type { OfferApplicationGuide } from "@/lib/offer-application-guide";

export type OfferCardData = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description?: string | null;
  url: string;
  source: "indeed" | "partner" | "autre";
  is_partner_exclusive: boolean;
  /** Raccourci candidat (tips JSON). */
  application_guide?: OfferApplicationGuide | null;
};

type OfferCardProps = {
  offer: OfferCardData;
  badge?: ReactNode;
  tag?: ReactNode;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPersistedOffer(offer: OfferCardData) {
  return UUID_PATTERN.test(offer.id);
}

function copyText(value: string, onDone: (message: string) => void, message: string) {
  if (!navigator.clipboard) {
    onDone("Copie indisponible sur ce navigateur.");
    return;
  }
  navigator.clipboard
    .writeText(value)
    .then(() => onDone(message))
    .catch(() => onDone("Copie impossible. Selectionne le texte manuellement."));
}

function buildMissionRecap(description?: string | null) {
  if (!description?.trim()) return "";

  const lines = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const missionsIndex = lines.findIndex((line) => /^missions?\b/i.test(line));
  if (missionsIndex === -1) return "";

  const missionLines: string[] = [];
  for (const line of lines.slice(missionsIndex + 1)) {
    if (/^(profil|infos clés|infos cles|contrat|lieu)\b/i.test(line)) break;
    if (!line.startsWith("•")) continue;
    missionLines.push(line.replace(/^•\s*/, "").trim());
    if (missionLines.length >= 4) break;
  }

  return missionLines.length > 0
    ? `Récap mission : ${missionLines.join(" / ")}`
    : "";
}

function OfferDetailsBlock({ offer }: { offer: OfferCardData }) {
  return (
    <div className="offer-details">
      <dl className="offer-details-grid">
        <div>
          <dt>Titre</dt>
          <dd>{offer.title}</dd>
        </div>
        <div>
          <dt>Entreprise</dt>
          <dd>{offer.company ?? "Non renseignee"}</dd>
        </div>
        <div>
          <dt>Lieu</dt>
          <dd>{offer.location ?? "Non renseigne"}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{offer.source === "partner" ? "Partenaire" : "Source officielle / externe"}</dd>
        </div>
      </dl>
      {offer.description?.trim() ? (
        <div className="offer-details-description">
          <p className="offer-details-label">Infos de l&apos;annonce</p>
          <p>{offer.description}</p>
        </div>
      ) : (
        <p className="muted offer-details-empty">
          Description non disponible dans ARTEMSI. Utilise le titre ou le lien officiel pour retrouver
          l&apos;annonce.
        </p>
      )}
      <OfferApplicationGuideBlock guide={offer.application_guide} />
    </div>
  );
}

type ProfileDocInfo = { exists: boolean; fileName?: string; filePath?: string };
type ProfileDocsPayload = {
  cv?: ProfileDocInfo;
  coverLetter?: ProfileDocInfo;
  exists?: boolean;
  fileName?: string;
  filePath?: string;
};

type DocumentChoice = { source: "profile" | "uploaded"; filePath: string; fileName: string };

async function submitApplication(
  offer: OfferCardData,
  cv: DocumentChoice | null,
  coverLetter: DocumentChoice | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: offer.title,
      company: offer.company ?? "",
      location: offer.location ?? "",
      url: offer.url,
      status: "sent",
      appliedAt: new Date().toISOString().slice(0, 10),
      notes: buildMissionRecap(offer.description),
      offerId: isPersistedOffer(offer) ? offer.id : null,
      cvStoragePath: cv?.filePath ?? null,
      cvFileName: cv?.fileName ?? null,
      coverLetterStoragePath: coverLetter?.filePath ?? null,
      coverLetterFileName: coverLetter?.fileName ?? null,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: data.error ?? "Impossible d'ajouter au suivi." };
  }
  return { ok: true };
}

function PartnerOfferApplyDialog({
  offer,
  onClose,
  onSuccess,
}: {
  offer: OfferCardData;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [profileCv, setProfileCv] = useState<ProfileDocInfo>({ exists: false });
  const [profileCoverLetter, setProfileCoverLetter] = useState<ProfileDocInfo>({ exists: false });
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [cvChoice, setCvChoice] = useState<"profile" | "uploaded">("profile");
  const [coverLetterChoice, setCoverLetterChoice] = useState<"none" | "profile" | "uploaded">(
    "none",
  );
  const [uploadedCv, setUploadedCv] = useState<{ filePath: string; fileName: string } | null>(null);
  const [uploadedCoverLetter, setUploadedCoverLetter] = useState<{
    filePath: string;
    fileName: string;
  } | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile/cv")
      .then((res) => res.json())
      .then((data: ProfileDocsPayload) => {
        if (cancelled) return;

        // Compat: ancien format de route { exists, fileName, filePath }.
        if (typeof data.exists === "boolean") {
          const legacyCv: ProfileDocInfo = {
            exists: data.exists,
            fileName: data.fileName,
            filePath: data.filePath,
          };
          setProfileCv(legacyCv);
          setProfileCoverLetter({ exists: false });
          if (!legacyCv.exists) setCvChoice("uploaded");
          return;
        }

        const cv = data.cv ?? { exists: false };
        const coverLetter = data.coverLetter ?? { exists: false };
        setProfileCv(cv);
        setProfileCoverLetter(coverLetter);
        if (!cv.exists) setCvChoice("uploaded");
      })
      .catch(() => {
        if (!cancelled) {
          setProfileCv({ exists: false });
          setProfileCoverLetter({ exists: false });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDocs(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
    documentType: "cv" | "cover_letter",
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (documentType === "cv") setUploadingCv(true);
    if (documentType === "cover_letter") setUploadingCoverLetter(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      const res = await fetch("/api/applications/cv-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload impossible.");
      if (documentType === "cv") {
        setUploadedCv({ filePath: data.filePath, fileName: data.fileName });
        setCvChoice("uploaded");
      } else {
        setUploadedCoverLetter({ filePath: data.filePath, fileName: data.fileName });
        setCoverLetterChoice("uploaded");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible.");
    } finally {
      if (documentType === "cv") setUploadingCv(false);
      if (documentType === "cover_letter") setUploadingCoverLetter(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    let cv: DocumentChoice | null = null;
    if (cvChoice === "profile" && profileCv.exists) {
      cv = { source: "profile", filePath: profileCv.filePath!, fileName: profileCv.fileName! };
    } else if (cvChoice === "uploaded" && uploadedCv) {
      cv = { source: "uploaded", filePath: uploadedCv.filePath, fileName: uploadedCv.fileName };
    } else {
      setError("Choisis un CV avant de confirmer la candidature.");
      return;
    }

    let coverLetter: DocumentChoice | null = null;
    if (coverLetterChoice === "profile" && profileCoverLetter.exists) {
      coverLetter = {
        source: "profile",
        filePath: profileCoverLetter.filePath!,
        fileName: profileCoverLetter.fileName!,
      };
    } else if (coverLetterChoice === "uploaded" && uploadedCoverLetter) {
      coverLetter = {
        source: "uploaded",
        filePath: uploadedCoverLetter.filePath,
        fileName: uploadedCoverLetter.fileName,
      };
    } else if (coverLetterChoice === "profile") {
      setError("Aucune LM principale détectée. Choisis une autre option.");
      return;
    } else if (coverLetterChoice === "uploaded") {
      setError("Upload une LM avant de confirmer la candidature.");
      return;
    }

    setSubmitting(true);
    const result = await submitApplication(offer, cv, coverLetter);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <div className="offer-apply-dialog" role="dialog" aria-modal="true">
      <div className="offer-apply-dialog-head">
        <p className="offer-details-label">Candidature offre partenaire</p>
        <button type="button" className="offer-apply-dialog-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      </div>
      <p className="muted small-label">
        Choisis le CV à associer à cette candidature. Ton CV principal reste inchangé.
      </p>

      <div className="offer-apply-cv-choice">
        <label className={`offer-apply-cv-option${cvChoice === "profile" ? " is-active" : ""}`}>
          <input
            type="radio"
            name="cv-choice"
            value="profile"
            checked={cvChoice === "profile"}
            onChange={() => setCvChoice("profile")}
            disabled={loadingDocs || !profileCv.exists}
          />
          <div>
            <strong>Utiliser mon CV principal</strong>
            <span className="muted">
              {loadingDocs
                ? "Chargement…"
                : profileCv.exists
                  ? profileCv.fileName
                  : "Aucun CV dans ton profil. Ajoute-le d'abord ou uploade-en un ci-dessous."}
            </span>
          </div>
        </label>

        <label className={`offer-apply-cv-option${cvChoice === "uploaded" ? " is-active" : ""}`}>
          <input
            type="radio"
            name="cv-choice"
            value="uploaded"
            checked={cvChoice === "uploaded"}
            onChange={() => setCvChoice("uploaded")}
          />
          <div>
            <strong>Uploader un autre CV pour cette offre</strong>
            <span className="muted">
              {uploadedCv ? `Sélectionné : ${uploadedCv.fileName}` : "PDF ou Word, 10 Mo max."}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => void handleUpload(event, "cv")}
              disabled={uploadingCv}
            />
            {uploadingCv ? <p className="muted small-label">Upload en cours…</p> : null}
          </div>
        </label>
      </div>

      <p className="muted small-label">Lettre de motivation (optionnelle).</p>

      <div className="offer-apply-cv-choice">
        <label className={`offer-apply-cv-option${coverLetterChoice === "none" ? " is-active" : ""}`}>
          <input
            type="radio"
            name="cover-letter-choice"
            value="none"
            checked={coverLetterChoice === "none"}
            onChange={() => setCoverLetterChoice("none")}
          />
          <div>
            <strong>Ne pas joindre de LM</strong>
            <span className="muted">Tu pourras toujours l&apos;ajouter plus tard dans ton suivi.</span>
          </div>
        </label>

        <label
          className={`offer-apply-cv-option${coverLetterChoice === "profile" ? " is-active" : ""}`}
        >
          <input
            type="radio"
            name="cover-letter-choice"
            value="profile"
            checked={coverLetterChoice === "profile"}
            onChange={() => setCoverLetterChoice("profile")}
            disabled={loadingDocs || !profileCoverLetter.exists}
          />
          <div>
            <strong>Utiliser ma LM principale</strong>
            <span className="muted">
              {loadingDocs
                ? "Chargement…"
                : profileCoverLetter.exists
                  ? profileCoverLetter.fileName
                  : "Aucune LM dans ton profil. Uploade-en une ci-dessous si besoin."}
            </span>
          </div>
        </label>

        <label
          className={`offer-apply-cv-option${coverLetterChoice === "uploaded" ? " is-active" : ""}`}
        >
          <input
            type="radio"
            name="cover-letter-choice"
            value="uploaded"
            checked={coverLetterChoice === "uploaded"}
            onChange={() => setCoverLetterChoice("uploaded")}
          />
          <div>
            <strong>Uploader une LM spécifique pour cette offre</strong>
            <span className="muted">
              {uploadedCoverLetter
                ? `Sélectionné : ${uploadedCoverLetter.fileName}`
                : "PDF ou Word, 10 Mo max."}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => void handleUpload(event, "cover_letter")}
              disabled={uploadingCoverLetter}
            />
            {uploadingCoverLetter ? <p className="muted small-label">Upload en cours…</p> : null}
          </div>
        </label>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="form-actions">
        <button type="button" className="button-link secondary-link" onClick={onClose}>
          Annuler
        </button>
        <button
          type="button"
          className="button-link offer-apply-btn"
          onClick={handleConfirm}
          disabled={submitting || uploadingCv || uploadingCoverLetter}
        >
          {submitting ? "Envoi…" : "Confirmer ma candidature"}
        </button>
      </div>
    </div>
  );
}

export function OfferApplicationButton({ offer }: { offer: OfferCardData }) {
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isPartner = offer.source === "partner" || offer.is_partner_exclusive;
  const isPersisted = isPersistedOffer(offer);
  const canApply = isPersisted;
  const buttonTitle = !isPersisted
    ? "Offre fictive : candidature désactivée."
    : undefined;
  const buttonLabel = !isPersisted
    ? "Exemple"
    : applying
      ? "Ajout…"
      : "Candidater";

  async function createApplicationDirect() {
    if (!canApply) return;
    setApplying(true);
    setApplicationStatus(null);
    const result = await submitApplication(offer, null, null);
    setApplying(false);
    if (!result.ok) {
      setApplicationStatus(result.error);
      return;
    }
    setApplicationStatus("Candidature ajoutée au suivi.");
    router.refresh();
  }

  function handleClick() {
    if (!canApply) return;
    if (isPartner) {
      setDialogOpen(true);
      return;
    }
    void createApplicationDirect();
  }

  return (
    <span className={`offer-action-with-feedback${dialogOpen ? " is-dialog-open" : ""}`}>
      <button
        type="button"
        className="button-link offer-apply-btn"
        onClick={handleClick}
        disabled={applying || !canApply}
        title={buttonTitle}
      >
        {buttonLabel}
      </button>
      {applicationStatus ? (
        <span className="offer-apply-feedback muted">{applicationStatus}</span>
      ) : null}
      {dialogOpen ? (
        <PartnerOfferApplyDialog
          offer={offer}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => {
            setDialogOpen(false);
            setApplicationStatus("Candidature ajoutée au suivi.");
            router.refresh();
          }}
        />
      ) : null}
    </span>
  );
}

export function OfferOfficialActions({ offer }: { offer: OfferCardData }) {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="offer-official-actions">
      <div className="offer-primary-actions">
        <a
          className="button-link secondary-link offer-site-btn"
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Aller sur le site
        </a>
        <OfferApplicationButton offer={offer} />
      </div>
      <div className="offer-secondary-actions" aria-label="Autres actions">
        <button
          type="button"
          className="inline-link-button"
          onClick={() => copyText(offer.title, setCopied, "Titre copie.")}
        >
          Copier le titre
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          className="inline-link-button"
          onClick={() => copyText(offer.url, setCopied, "Lien copie.")}
        >
          Copier le lien
        </button>
      </div>
      {copied ? <p className="offer-copy-feedback muted">{copied}</p> : null}
      <p className="offer-source-hint muted">
        Si le site entreprise bloque l&apos;ouverture, copie le titre et recherche-le directement sur le
        site carrieres officiel.
      </p>
    </div>
  );
}

export function OfferFullscreenModal({
  offer,
  onClose,
}: {
  offer: OfferCardData;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="offer-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="offer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`offer-modal-title-${offer.id}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="offer-modal-header">
          <div>
            <p className="offer-details-label">Offre complète</p>
            <h2 id={`offer-modal-title-${offer.id}`}>{offer.title}</h2>
            <p className="offer-meta">
              {offer.company ? <span>{offer.company}</span> : null}
              {offer.company && offer.location ? <span> - </span> : null}
              {offer.location ? <span>{offer.location}</span> : null}
            </p>
          </div>
          <button type="button" className="offer-modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </header>

        <div className="offer-modal-body">
          <OfferDetailsBlock offer={offer} />
          <OfferOfficialActions offer={offer} />
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function OfferCard({ offer, badge, tag }: OfferCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={`offer-card offer-card--clickable${open ? " offer-card--open" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => setOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      }}
      aria-label={`Voir le détail de l'offre ${offer.title}`}
    >
      <div className="offer-card-header">
        <span className="offer-card-header-slot">{badge}</span>
        <span className="offer-card-header-slot">{tag}</span>
      </div>
      <h3 className="offer-title">{offer.title}</h3>
      <p className="offer-meta">
        {offer.company ? <span>{offer.company}</span> : null}
        {offer.company && offer.location ? <span> - </span> : null}
        {offer.location ? <span>{offer.location}</span> : null}
      </p>
      <div className="offer-card-actions offer-card-actions--compact">
        <button
          type="button"
          className="button-link offer-view-btn"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
          aria-expanded={open}
        >
          Voir l&apos;offre
        </button>
      </div>
      {open ? <OfferFullscreenModal offer={offer} onClose={() => setOpen(false)} /> : null}
    </article>
  );
}
