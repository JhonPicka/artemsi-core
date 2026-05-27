import { NextResponse } from "next/server";

import { hasApiBillingAccess } from "@/lib/billing";
import { MAX_DOCUMENT_SIZE_BYTES, SUPPORTED_DOCUMENT_MIME_TYPES } from "@/lib/constants";
import { getRequestKey, takeRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { documentUploadSchema } from "@/lib/validation";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

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

  const rate = takeRateLimit({
    bucket: "profile-document-upload",
    key: getRequestKey(request, user.id),
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Trop d'uploads, réessaie dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  const formData = await request.formData();
  const documentType = formData.get("documentType");
  const file = formData.get("file");

  if (
    typeof documentType !== "string" ||
    !(file instanceof File) ||
    !SUPPORTED_DOCUMENT_MIME_TYPES.includes(file.type as (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number]) ||
    file.size > MAX_DOCUMENT_SIZE_BYTES
  ) {
    return NextResponse.json({ error: "Document invalide" }, { status: 400 });
  }

  const metadataValidation = documentUploadSchema.safeParse({
    documentType,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  if (!metadataValidation.success) {
    return NextResponse.json(
      {
        error:
          metadataValidation.error.issues[0]?.message ?? "Metadata document invalide",
      },
      { status: 400 },
    );
  }

  const safeName = sanitizeFileName(file.name);
  const filePath = `${user.id}/${documentType}/${Date.now()}-${safeName}`;
  const arrayBuffer = await file.arrayBuffer();

  const uploadResult = await supabase.storage
    .from("user-documents")
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadResult.error) {
    return NextResponse.json({ error: uploadResult.error.message }, { status: 500 });
  }

  await supabase
    .from("user_documents")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("document_type", documentType)
    .eq("is_active", true);

  const { error: insertError } = await supabase.from("user_documents").insert({
    user_id: user.id,
    document_type: documentType,
    file_path: filePath,
    file_name: file.name,
    mime_type: file.type,
    file_size_bytes: file.size,
    is_active: true,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
