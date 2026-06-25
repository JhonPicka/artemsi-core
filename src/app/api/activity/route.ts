import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminUser } from "@/lib/admin-auth";
import { getRequestKey, takeRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { recordUserActivity } from "@/lib/user-activity";

const bodySchema = z.object({
  eventType: z.string().min(1).max(80),
  payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAdminUser(user)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const rate = await takeRateLimit({
    bucket: "user-activity",
    key: getRequestKey(request, user.id),
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload invalide" },
      { status: 400 },
    );
  }

  await recordUserActivity(supabase, user.id, parsed.data.eventType, parsed.data.payload ?? {});

  return NextResponse.json({ ok: true });
}
