import { ProfileMainClient } from "@/components/profile/profile-main-client";
import { requireUser } from "@/lib/auth";
import {
  CONTRACT_DURATION_LABEL,
  CONTRACT_DURATIONS,
  CONTRACT_TYPE_LABEL,
  CONTRACT_TYPES,
  STUDY_DOMAIN_LABEL,
  STUDY_DOMAINS,
  STUDY_LEVEL_LABEL,
  STUDY_LEVEL_OPTIONS,
  type ContractDuration,
  type ContractType,
  type StudyDomain,
  type StudyLevel,
} from "@/lib/constants";
import { formatFrenchLongDate } from "@/lib/dates-fr";
import { createClient } from "@/lib/supabase/server";

function fmt<T extends string>(
  value: string | null | undefined,
  labels: Record<T, string>,
): string {
  if (!value) return "—";
  return labels[value as T] ?? value;
}

function initials(fullName: string | null | undefined, email: string) {
  const n = (fullName ?? "").trim();
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length === 1) {
    return (parts[0][0] + (email[0] ?? "?")).toUpperCase();
  }
  const em = email.trim();
  return em.length >= 2 ? em.slice(0, 2).toUpperCase() : "ME";
}

export default async function DashboardProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: documentsRaw }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, phone, school_name, target_job, regions, study_level, study_domain, contract_type, contract_duration, start_date",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_documents")
      .select("id, document_type, file_name, uploaded_at, file_path")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("uploaded_at", { ascending: false }),
  ]);

  const documents = await Promise.all(
    (documentsRaw ?? []).map(async (doc) => {
      const { data, error } = await supabase.storage
        .from("user-documents")
        .createSignedUrl(doc.file_path, 60 * 60);

      return {
        ...doc,
        signedUrl: error ? null : data.signedUrl,
      };
    }),
  );

  const cvDoc = documents.find((d) => d.document_type === "cv");
  const letterDoc = documents.find((d) => d.document_type === "cover_letter");

  const studyLevelInitial: StudyLevel = STUDY_LEVEL_OPTIONS.includes(
    (profile?.study_level ?? "") as StudyLevel,
  )
    ? (profile?.study_level as StudyLevel)
    : STUDY_LEVEL_OPTIONS[0];

  const studyDomainInitial: StudyDomain = STUDY_DOMAINS.includes(
    (profile?.study_domain ?? "") as StudyDomain,
  )
    ? (profile?.study_domain as StudyDomain)
    : STUDY_DOMAINS[0];

  const contractTypeInitial: ContractType = CONTRACT_TYPES.includes(
    (profile?.contract_type ?? "") as ContractType,
  )
    ? (profile?.contract_type as ContractType)
    : CONTRACT_TYPES[0];

  const contractDurationInitial: ContractDuration = CONTRACT_DURATIONS.includes(
    (profile?.contract_duration ?? "") as ContractDuration,
  )
    ? (profile?.contract_duration as ContractDuration)
    : "12_MONTHS";

  const displayName =
    (profile?.full_name ?? "").trim() || user.email?.split("@")[0] || "Candidat";

  const summaryRows: { label: string; value: string }[] = [
    { label: "Téléphone", value: profile?.phone?.trim() || "—" },
    { label: "Établissement", value: profile?.school_name?.trim() || "—" },
    { label: "Niveau", value: fmt(profile?.study_level, STUDY_LEVEL_LABEL) },
    { label: "Domaine", value: fmt(profile?.study_domain, STUDY_DOMAIN_LABEL) },
    { label: "Poste visé", value: profile?.target_job?.trim() || "—" },
    { label: "Type de contrat", value: fmt(profile?.contract_type, CONTRACT_TYPE_LABEL) },
    { label: "Durée", value: fmt(profile?.contract_duration, CONTRACT_DURATION_LABEL) },
    {
      label: "Début souhaité",
      value: profile?.start_date ? formatFrenchLongDate(profile.start_date) : "—",
    },
    {
      label: "Zones",
      value: (profile?.regions ?? []).length ? (profile?.regions ?? []).join(" · ") : "—",
    },
  ];

  return (
    <div className="profile-page">
      <header className="card profile-hero">
        <div className="profile-hero-avatar" aria-hidden="true">
          {initials(profile?.full_name, user.email ?? "")}
        </div>
        <div className="profile-hero-text">
          <p className="profile-hero-eyebrow">Profil candidat</p>
          <h1 className="profile-hero-name">{displayName}</h1>
          <p className="profile-hero-email">{user.email}</p>
        </div>
      </header>

      <ProfileMainClient
        summaryRows={summaryRows}
        cvDoc={
          cvDoc
            ? { file_name: cvDoc.file_name, signedUrl: cvDoc.signedUrl }
            : null
        }
        letterDoc={
          letterDoc
            ? { file_name: letterDoc.file_name, signedUrl: letterDoc.signedUrl }
            : null
        }
        editorInitialValues={{
          fullName: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
          schoolName: profile?.school_name ?? "",
          studyLevel: studyLevelInitial,
          studyDomain: studyDomainInitial,
          targetJob: profile?.target_job ?? "",
          regions: profile?.regions ?? [],
          startDate: profile?.start_date ?? "",
          contractType: contractTypeInitial,
          contractDuration: contractDurationInitial,
        }}
      />
    </div>
  );
}
