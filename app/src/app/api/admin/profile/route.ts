import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminUser } from "@/lib/admin-auth";
import { upsertAdminProfile } from "@/lib/admin-profile";
import { createClient } from "@/lib/supabase/server";

const adminSetupSchema = z.object({
  fullName: z.string().min(2, "Nom requis"),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = adminSetupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" },
      { status: 400 },
    );
  }

  try {
    await upsertAdminProfile({
      userId: user.id,
      email: user.email,
      fullName: parsed.data.fullName,
    });
    return NextResponse.json({ ok: true });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
