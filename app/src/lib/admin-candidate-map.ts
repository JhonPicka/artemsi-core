import {
  ACQUISITION_SOURCE_LABEL,
  ALTERNANCE_RHYTHM_LABEL,
  APPLICATIONS_SENT_RANGE_LABEL,
  CONTRACT_DURATION_LABEL,
  CONTRACT_TYPE_LABEL,
  PREFERRED_SECTOR_LABEL,
  SEARCH_LEVEL_LABEL,
  STUDY_DOMAIN_LABEL,
  STUDY_LEVEL_LABEL,
  type AcquisitionSource,
  type AlternanceRhythm,
  type ApplicationsSentRange,
  type ContractDuration,
  type ContractType,
  type PreferredSector,
  type SearchLevel,
  type StudyDomain,
  type StudyLevel,
} from "@/lib/constants";
import type { AdminCandidateProfile } from "@/lib/admin-stats";

export function mapCandidate(row: Record<string, unknown>): AdminCandidateProfile {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: (row.full_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    schoolName: (row.school_name as string | null) ?? null,
    studyLevel: row.study_level
      ? (STUDY_LEVEL_LABEL[row.study_level as StudyLevel] ?? String(row.study_level))
      : null,
    studyDomain: row.study_domain
      ? (STUDY_DOMAIN_LABEL[row.study_domain as StudyDomain] ?? String(row.study_domain))
      : null,
    targetJob: (row.target_job as string | null) ?? null,
    regions: (row.regions as string[] | null) ?? [],
    startDate: (row.start_date as string | null) ?? null,
    contractType: row.contract_type
      ? (CONTRACT_TYPE_LABEL[row.contract_type as ContractType] ?? String(row.contract_type))
      : null,
    contractDuration: row.contract_duration
      ? (CONTRACT_DURATION_LABEL[row.contract_duration as ContractDuration] ??
        String(row.contract_duration))
      : null,
    alternanceRhythm: row.alternance_rhythm
      ? (ALTERNANCE_RHYTHM_LABEL[row.alternance_rhythm as AlternanceRhythm] ??
        String(row.alternance_rhythm))
      : null,
    alternanceRhythmOther: (row.alternance_rhythm_other as string | null) ?? null,
    preferredSectors: ((row.preferred_sectors as string[] | null) ?? []).map(
      (sector) => PREFERRED_SECTOR_LABEL[sector as PreferredSector] ?? sector,
    ),
    acquisitionSource: row.acquisition_source
      ? (ACQUISITION_SOURCE_LABEL[row.acquisition_source as AcquisitionSource] ??
        String(row.acquisition_source))
      : null,
    acquisitionSourceOther: (row.acquisition_source_other as string | null) ?? null,
    applicationsSentRange: row.applications_sent_range
      ? (APPLICATIONS_SENT_RANGE_LABEL[row.applications_sent_range as ApplicationsSentRange] ??
        String(row.applications_sent_range))
      : null,
    searchLevel: row.search_level
      ? (SEARCH_LEVEL_LABEL[row.search_level as SearchLevel] ?? String(row.search_level))
      : null,
    onboardingCompleted: Boolean(row.onboarding_completed),
    subscriptionStatus: String(row.subscription_status ?? "inactive"),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
