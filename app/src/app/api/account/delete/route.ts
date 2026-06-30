import { NextResponse } from "next/server";

import {
  accountDeletionSchema,
  purgeUserDocumentsStorage,
} from "@/lib/account-deletion";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = accountDeletionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      {
        error:
          "Suppression indisponible pour le moment. Écris-nous à contact@artemsi.fr.",
      },
      { status: 503 },
    );
  }

  const email = user.email ?? null;

  const feedbackInsert = await admin.from("account_deletion_feedback").insert({
    user_id: user.id,
    email,
    reason_code: parsed.data.reasonCode,
    reason_detail: parsed.data.reasonDetail ?? null,
  });

  if (feedbackInsert.error) {
    return NextResponse.json({ error: feedbackInsert.error.message }, { status: 500 });
  }

  try {
    await purgeUserDocumentsStorage(admin, user.id);
  } catch (storageError) {
    const message =
      storageError instanceof Error ? storageError.message : "Erreur stockage.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (email) {
    await admin.from("billing_customers").delete().eq("email", email);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
