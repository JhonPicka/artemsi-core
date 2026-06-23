import { NextResponse } from "next/server";

import { hasApiAccountAccess } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

/**
 * Retourne les documents actifs du candidat pour pre-remplir le wizard candidature.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasApiAccountAccess(user))) {
    return NextResponse.json({ error: "Abonnement actif requis." }, { status: 402 });
  }

  const { data, error } = await supabase
    .from("user_documents")
    .select("document_type, file_path, file_name")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .in("document_type", ["cv", "cover_letter"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cv = (data ?? []).find((doc) => doc.document_type === "cv");
  const coverLetter = (data ?? []).find((doc) => doc.document_type === "cover_letter");

  return NextResponse.json({
    cv: cv
      ? { exists: true, fileName: cv.file_name as string, filePath: cv.file_path as string }
      : { exists: false },
    coverLetter: coverLetter
      ? {
          exists: true,
          fileName: coverLetter.file_name as string,
          filePath: coverLetter.file_path as string,
        }
      : { exists: false },
  });
}
