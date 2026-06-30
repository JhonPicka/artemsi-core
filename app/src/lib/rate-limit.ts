import { createAdminClient } from "@/lib/supabase/admin";

type RateLimitInput = {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  ok: boolean;
  retryAfterSec: number;
};

const store = new Map<string, { count: number; resetAt: number }>();

function takeInMemoryRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const id = `${input.bucket}:${input.key}`;
  const current = store.get(id);

  if (!current || current.resetAt <= now) {
    store.set(id, { count: 1, resetAt: now + input.windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (current.count >= input.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(id, current);
  return { ok: true, retryAfterSec: 0 };
}

export function getRequestKey(request: Request, userId?: string) {
  if (userId) return `user:${userId}`;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return `ip:${forwarded.split(",")[0]?.trim() ?? "unknown"}`;

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return `ip:${realIp.trim()}`;

  return "ip:unknown";
}

export async function takeRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  try {
    const supabase = createAdminClient();
    const nowMs = Date.now();
    const windowSec = Math.max(1, Math.floor(input.windowMs / 1000));
    const { data, error } = await supabase.rpc("consume_rate_limit", {
      p_bucket: input.bucket,
      p_key: input.key,
      p_limit: input.limit,
      p_window_seconds: windowSec,
      p_now_ms: nowMs,
    });

    if (error) {
      return takeInMemoryRateLimit(input);
    }

    if (Array.isArray(data) && data[0]) {
      const row = data[0] as { ok?: boolean; retry_after_sec?: number };
      return {
        ok: Boolean(row.ok),
        retryAfterSec: Number(row.retry_after_sec ?? 0),
      };
    }

    return takeInMemoryRateLimit(input);
  } catch {
    return takeInMemoryRateLimit(input);
  }
}
