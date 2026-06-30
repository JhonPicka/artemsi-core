import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";

type SetupTokenPayload = {
  email: string;
  userId: string;
  exp: number;
};

function signingSecret() {
  return (
    process.env.SETUP_TOKEN_SECRET ??
    process.env.CRON_SECRET ??
    env.SUPABASE_SERVICE_ROLE_KEY ??
    "artemsi-setup-token-fallback"
  );
}

function encodePayload(payload: SetupTokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): SetupTokenPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SetupTokenPayload;
    if (!parsed.email || !parsed.userId || !parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function createSetupToken(params: { email: string; userId: string }) {
  const payload: SetupTokenPayload = {
    email: params.email.trim().toLowerCase(),
    userId: params.userId,
    exp: Date.now() + 30 * 60 * 1000,
  };
  const encoded = encodePayload(payload);
  const signature = createHmac("sha256", signingSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySetupToken(token: string): SetupTokenPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = createHmac("sha256", signingSecret()).update(encoded).digest("base64url");
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  const payload = decodePayload(encoded);
  if (!payload || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}
