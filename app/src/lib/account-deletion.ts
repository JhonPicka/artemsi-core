import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const ACCOUNT_DELETION_REASON_CODES = [
  "found_alternance",
  "found_job",
  "not_useful",
  "too_expensive",
  "privacy",
  "other",
] as const;

export type AccountDeletionReasonCode = (typeof ACCOUNT_DELETION_REASON_CODES)[number];

export const ACCOUNT_DELETION_REASONS: {
  code: AccountDeletionReasonCode;
  label: string;
}[] = [
  { code: "found_alternance", label: "J'ai trouvé une alternance" },
  { code: "found_job", label: "J'ai trouvé un autre emploi ou stage" },
  { code: "not_useful", label: "Le service ne m'a pas aidé" },
  { code: "too_expensive", label: "C'est trop cher pour moi" },
  { code: "privacy", label: "Je préfère limiter mes données en ligne" },
  { code: "other", label: "Autre raison" },
];

export const accountDeletionSchema = z.object({
  reasonCode: z.enum(ACCOUNT_DELETION_REASON_CODES, {
    error: "Choisis une raison dans la liste.",
  }),
  reasonDetail: z
    .string()
    .max(500, "500 caractères maximum.")
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
  confirm: z.literal(true, {
    error: "Tu dois confirmer la suppression définitive.",
  }),
});

const USER_DOCUMENTS_BUCKET = "user-documents";

type AdminClient = SupabaseClient;

export async function purgeUserDocumentsStorage(
  admin: AdminClient,
  userId: string,
): Promise<void> {
  await removeStoragePrefix(admin, USER_DOCUMENTS_BUCKET, userId);
}

async function removeStoragePrefix(
  admin: AdminClient,
  bucket: string,
  prefix: string,
): Promise<void> {
  const { data, error } = await admin.storage.from(bucket).list(prefix, {
    limit: 1000,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return;
  }

  const filePaths: string[] = [];
  const folderPrefixes: string[] = [];

  for (const item of data) {
    const path = `${prefix}/${item.name}`;
    if (item.id === null) {
      folderPrefixes.push(path);
    } else {
      filePaths.push(path);
    }
  }

  for (const folder of folderPrefixes) {
    await removeStoragePrefix(admin, bucket, folder);
  }

  if (filePaths.length > 0) {
    const { error: removeError } = await admin.storage.from(bucket).remove(filePaths);
    if (removeError) {
      throw new Error(removeError.message);
    }
  }
}
