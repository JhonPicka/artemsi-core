import { NextResponse } from "next/server";

import { hasApiBillingAccess } from "@/lib/billing";
import { normalizeToYyyyMmDd } from "@/lib/dates-fr";
import { createClient } from "@/lib/supabase/server";
import {
  applicationCreateSchema,
  applicationUpdateSchema,
} from "@/lib/validation";

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

  const payload = await request.json().catch(() => null);
  const parsed = applicationCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const offerId = parsed.data.offerId ?? null;

  if (offerId) {
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("offer_id", offerId)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json(
        { error: "Tu as déjà une candidature liée à cette offre." },
        { status: 409 },
      );
    }
  }

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    title: parsed.data.title,
    company: parsed.data.company || null,
    location: parsed.data.location || null,
    url: parsed.data.url || null,
    status: parsed.data.status,
    applied_at: normalizeToYyyyMmDd(parsed.data.appliedAt),
    notes: parsed.data.notes || null,
    offer_id: offerId,
    cv_storage_path: parsed.data.cvStoragePath ?? null,
    cv_file_name: parsed.data.cvFileName ?? null,
    cover_letter_storage_path: parsed.data.coverLetterStoragePath ?? null,
    cover_letter_file_name: parsed.data.coverLetterFileName ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
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

  const payload = await request.json().catch(() => null);
  const parsed = applicationUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
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

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
