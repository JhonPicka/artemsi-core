import { getTodayYyyyMmDdParis } from "@/lib/dates-fr";
import { createAdminClient } from "@/lib/supabase/admin";

export type LbaImportDailyDecision = {
  importDate: string;
  approved: boolean;
  decidedAt: string | null;
  decidedBy: string | null;
};

function parseImportDate(value: string): string {
  return value.slice(0, 10);
}

export function getLbaImportDateParis(): string {
  return getTodayYyyyMmDdParis();
}

export async function getLbaImportDailyDecision(
  importDate = getLbaImportDateParis(),
): Promise<LbaImportDailyDecision> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lba_import_daily_decisions")
    .select("import_date, approved, decided_at, decided_by")
    .eq("import_date", importDate)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    return {
      importDate,
      approved: false,
      decidedAt: null,
      decidedBy: null,
    };
  }

  return {
    importDate: parseImportDate(String(data.import_date)),
    approved: Boolean(data.approved),
    decidedAt: (data.decided_at as string | null) ?? null,
    decidedBy: (data.decided_by as string | null) ?? null,
  };
}

export async function isLbaImportApprovedToday(): Promise<boolean> {
  const decision = await getLbaImportDailyDecision();
  return decision.approved;
}

export async function setLbaImportDailyDecision(input: {
  approved: boolean;
  decidedBy: string;
  importDate?: string;
}): Promise<LbaImportDailyDecision> {
  const supabase = createAdminClient();
  const importDate = input.importDate ?? getLbaImportDateParis();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("lba_import_daily_decisions")
    .upsert(
      {
        import_date: importDate,
        approved: input.approved,
        decided_at: now,
        decided_by: input.decidedBy,
      },
      { onConflict: "import_date" },
    )
    .select("import_date, approved, decided_at, decided_by")
    .single();

  if (error) throw new Error(error.message);

  return {
    importDate: parseImportDate(String(data.import_date)),
    approved: Boolean(data.approved),
    decidedAt: (data.decided_at as string | null) ?? null,
    decidedBy: (data.decided_by as string | null) ?? null,
  };
}
