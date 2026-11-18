import "server-only";

import { createHmac, createPublicKey, createVerify, timingSafeEqual } from "node:crypto";
import { authSecret } from "@/lib/session-token";

export const GOOGLE_OAUTH_COOKIE = "cartok_google_oauth";
const OAUTH_MAX_AGE_SECONDS = 10 * 60;
const CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export type PendingGoogleLogin = { state: string; verifier: string; next: string };
export type GoogleIdentity = { sub: string; email: string; name: string };

type Jwk = { kid?: string; kty?: string; n?: string; e?: string; alg?: string };

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const googleOauthCookieOptions = { ...cookieBase, maxAge: OAUTH_MAX_AGE_SECONDS };

export function clearGoogleOauthCookieOptions() {
  return { ...cookieBase, maxAge: 0 };
}

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** Публичный адрес приложения. За прокси задайте APP_URL, иначе redirect URI не совпадёт с консолью Google. */
export function appOrigin(request: Request): string {
  const configured = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}

export function googleRedirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

export function signGoogleLogin(pending: PendingGoogleLogin): string {
  const body = Buffer.from(
    JSON.stringify({ ...pending, exp: Date.now() + OAUTH_MAX_AGE_SECONDS * 1000 }),
  ).toString("base64url");
  const signature = createHmac("sha256", authSecret()).update(`google.${body}`).digest("base64url");
  return `${body}.${signature}`;
}

export function readGoogleLogin(token: string | undefined): PendingGoogleLogin | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = createHmac("sha256", authSecret()).update(`google.${body}`).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      state?: unknown;
      verifier?: unknown;
      next?: unknown;
      exp?: unknown;
    };
    if (typeof payload.state !== "string" || typeof payload.verifier !== "string") return null;
    if (typeof payload.next !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return { state: payload.state, verifier: payload.verifier, next: payload.next };
  } catch {
    return null;
  }
}

export function sameSecret(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

let cachedCerts: { keys: Jwk[]; expiresAt: number } | null = null;

async function googleCerts(force: boolean): Promise<Jwk[]> {
  if (!force && cachedCerts && cachedCerts.expiresAt > Date.now()) return cachedCerts.keys;
  const response = await fetch(CERTS_URL, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`google certs: ${response.status}`);
  const data = (await response.json()) as { keys?: Jwk[] };
  const keys = Array.isArray(data.keys) ? data.keys : [];
  cachedCerts = { keys, expiresAt: Date.now() + 60 * 60 * 1000 };
  return keys;
}

function decodePart(segment: string): unknown {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Проверяет подпись id_token ключами Google и что токен выписан нашему клиенту. */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || idToken.length < 20 || idToken.length > 4096) return null;
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;

  let header: Record<string, unknown> | null;
  let payload: Record<string, unknown> | null;
  try {
    header = asRecord(decodePart(parts[0]));
    payload = asRecord(decodePart(parts[1]));
  } catch {
    return null;
  }
  if (!header || !payload || header.alg !== "RS256" || typeof header.kid !== "string") return null;

  const keys = await googleCerts(false);
  let jwk = keys.find((key) => key.kid === header.kid) ?? null;
  if (!jwk) jwk = (await googleCerts(true)).find((key) => key.kid === header.kid) ?? null;
  if (!jwk) return null;

  let valid = false;
  try {
    const key = createPublicKey({
      key: { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256" },
      format: "jwk",
    });
    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${parts[0]}.${parts[1]}`);
    valid = verifier.verify(key, Buffer.from(parts[2], "base64url"));
  } catch {
    return null;
  }
  if (!valid) return null;

  const now = Math.floor(Date.now() / 1000);
  const iss = payload.iss;
  const aud = payload.aud;
  const audienceOk = aud === clientId || (Array.isArray(aud) && aud.includes(clientId));
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  const iat = typeof payload.iat === "number" ? payload.iat : 0;
  if (iss !== "https://accounts.google.com" && iss !== "accounts.google.com") return null;
  if (typeof payload.azp === "string" && payload.azp !== clientId) return null;
  if (!audienceOk || exp < now - 60 || iat > now + 60) return null;
  if (payload.email_verified !== true) return null;
  if (typeof payload.sub !== "string" || !/^[A-Za-z0-9_-]{1,255}$/.test(payload.sub)) return null;
  if (typeof payload.email !== "string") return null;
  const email = payload.email.trim().toLowerCase();
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  const name = typeof payload.name === "string" ? payload.name : "";
  return { sub: payload.sub, email, name };
}

export async function exchangeGoogleCode(input: {
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: input.redirectUri,
      grant_type: "authorization_code",
      code_verifier: input.verifier,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { id_token?: unknown };
  return typeof data.id_token === "string" ? data.id_token : null;
}
