import { NextResponse } from "next/server";

import { hasApiBillingAccess } from "@/lib/billing";
import { MAX_DOCUMENT_SIZE_BYTES, SUPPORTED_DOCUMENT_MIME_TYPES } from "@/lib/constants";
import { getRequestKey, takeRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Upload d'un document alternatif (CV ou LM) lie a une candidature.
 * Le fichier est stocke dans le bucket prive user-documents sous un path dedie
 * sans modifier les documents principaux du profil.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasApiBillingAccess(user))) {
    return NextResponse.json({ error: "Abonnement actif requis." }, { status: 402 });
  }

  const rate = await takeRateLimit({
    bucket: "applications-document-upload",
    key: getRequestKey(request, user.id),
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Trop d'uploads, réessaie dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const requestedType = formData.get("documentType");
  const documentType =
    requestedType === "cover_letter" || requestedType === "cv" ? requestedType : "cv";

  if (
    !(file instanceof File) ||
    !SUPPORTED_DOCUMENT_MIME_TYPES.includes(
      file.type as (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number],
    ) ||
    file.size > MAX_DOCUMENT_SIZE_BYTES
  ) {
    return NextResponse.json(
      { error: "Document invalide (PDF ou Word, 10 Mo max)" },
      { status: 400 },
    );
  }

  const safeName = sanitizeFileName(file.name);
  const folder = documentType === "cover_letter" ? "application_cover_letter" : "application_cv";
  const filePath = `${user.id}/${folder}/${Date.now()}-${safeName}`;
  const arrayBuffer = await file.arrayBuffer();

  const upload = await supabase.storage
    .from("user-documents")
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    documentType,
    filePath,
    fileName: file.name,
  });
}
