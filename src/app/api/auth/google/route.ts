import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { safeNext } from "@/lib/navigation";
import {
  appOrigin,
  googleConfigured,
  GOOGLE_OAUTH_COOKIE,
  googleOauthCookieOptions,
  googleRedirectUri,
  signGoogleLogin,
} from "@/lib/google-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const origin = appOrigin(request);
  const login = new URL("/login", origin);
  login.searchParams.set("next", next);

  if (!googleConfigured()) {
    login.searchParams.set("error", "google_config");
    return NextResponse.redirect(login);
  }

  const state = randomBytes(16).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  auth.searchParams.set("redirect_uri", googleRedirectUri(origin));
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("code_challenge", challenge);
  auth.searchParams.set("code_challenge_method", "S256");
  auth.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(auth);
  response.cookies.set(
    GOOGLE_OAUTH_COOKIE,
    signGoogleLogin({ state, verifier, next }),
    googleOauthCookieOptions,
  );
  return response;
}
