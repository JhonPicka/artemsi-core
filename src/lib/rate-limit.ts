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

export function getRequestKey(request: Request, userId?: string) {
  if (userId) return `user:${userId}`;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return `ip:${forwarded.split(",")[0]?.trim() ?? "unknown"}`;

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return `ip:${realIp.trim()}`;

  return "ip:unknown";
}

export function takeRateLimit(input: RateLimitInput): RateLimitResult {
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
