"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { OfferApplicationGuideBlock } from "@/components/offers/offer-application-guide-block";
import { OfferReportDeadLinkButton } from "@/components/offers/offer-report-dead-link-button";
import { trackActivity } from "@/lib/track-activity-client";
import { USER_ACTIVITY_EVENTS } from "@/lib/user-activity";
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
  /** false = compte gratuit (pas de guide candidature, offres partenaires non postulables). */
  isPro?: boolean;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPersistedOffer(offer: OfferCardData) {
  return UUID_PATTERN.test(offer.id);
}

export function canOpenOfferExternally(offer: Pick<OfferCardData, "id" | "url">) {
  return isPersistedOffer(offer as OfferCardData) && Boolean(offer.url?.trim());
}

export function openOfferInNewTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
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

function OfferDetailsBlock({ offer, isPro = true }: { offer: OfferCardData; isPro?: boolean }) {
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
      </dl>
      {offer.description?.trim() ? (
        <div className="offer-details-description">
          <p className="offer-details-label">Infos de l&apos;annonce</p>
          <p>{offer.description}</p>
        </div>
      ) : (
        <p className="muted offer-details-empty">
          Description non disponible pour le moment. Ouvre l&apos;offre pour voir le détail complet.
        </p>
      )}
      {isPro ? <OfferApplicationGuideBlock guide={offer.application_guide} /> : null}
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

export function OfferApplicationButton({
  offer,
  isPro = true,
}: {
  offer: OfferCardData;
  isPro?: boolean;
}) {
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isPartner = offer.source === "partner" || offer.is_partner_exclusive;
  const partnerApplyBlocked = isPartner && !isPro;
  const isPersisted = isPersistedOffer(offer);
  const canApply = isPersisted && !partnerApplyBlocked;
  const buttonTitle = partnerApplyBlocked
    ? "Réservé aux abonnés Pro."
    : !isPersisted
      ? "Offre fictive : candidature désactivée."
      : undefined;
  const buttonLabel = partnerApplyBlocked
    ? "Candidater (Pro)"
    : !isPersisted
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

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (!canApply) return;
    trackActivity(USER_ACTIVITY_EVENTS.OFFER_APPLY_CLICK, {
      offerId: offer.id,
      offerTitle: offer.title,
      company: offer.company,
      source: offer.source,
    });
    if (isPartner) {
      setDialogOpen(true);
      return;
    }
    void createApplicationDirect();
  }

  return (
    <span
      className={`offer-action-with-feedback${dialogOpen ? " is-dialog-open" : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
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
      {partnerApplyBlocked ? (
        <span className="offer-apply-feedback muted">
          <Link href="/subscribe">Passe Pro</Link> pour candidater sur les offres partenaires.
        </span>
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

export function OfferOfficialActions({
  offer,
  isPro = true,
}: {
  offer: OfferCardData;
  isPro?: boolean;
}) {
  const isPersisted = isPersistedOffer(offer);

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
        <OfferApplicationButton offer={offer} isPro={isPro} />
      </div>
      <OfferReportDeadLinkButton offerId={offer.id} disabled={!isPersisted} />
    </div>
  );
}

export function OfferFullscreenModal({
  offer,
  onClose,
  isPro = true,
}: {
  offer: OfferCardData;
  onClose: () => void;
  isPro?: boolean;
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
          <OfferDetailsBlock offer={offer} isPro={isPro} />
          <OfferOfficialActions offer={offer} isPro={isPro} />
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function OfferCard({ offer, badge, tag, isPro = true }: OfferCardProps) {
  const isPersisted = isPersistedOffer(offer);
  const opensExternally = canOpenOfferExternally(offer);

  function handleOpenOffer() {
    if (!opensExternally) return;
    trackActivity(USER_ACTIVITY_EVENTS.OFFER_OPEN_EXTERNAL, {
      offerId: offer.id,
      offerTitle: offer.title,
      company: offer.company,
      source: offer.source,
    });
    openOfferInNewTab(offer.url);
  }

  return (
    <article
      className={`offer-card${opensExternally ? " offer-card--clickable" : ""}`}
      role={opensExternally ? "link" : undefined}
      tabIndex={opensExternally ? 0 : undefined}
      onClick={opensExternally ? handleOpenOffer : undefined}
      onKeyDown={
        opensExternally
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenOffer();
              }
            }
          : undefined
      }
      aria-label={opensExternally ? `Ouvrir l'offre ${offer.title} dans un nouvel onglet` : undefined}
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
        {opensExternally ? (
          <a
            className="button-link offer-view-btn"
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Voir l&apos;offre
          </a>
        ) : (
          <span className="button-link offer-view-btn is-disabled" aria-disabled="true">
            Voir l&apos;offre
          </span>
        )}
        <OfferApplicationButton offer={offer} isPro={isPro} />
        <OfferReportDeadLinkButton offerId={offer.id} disabled={!isPersisted} />
      </div>
    </article>
  );
}
