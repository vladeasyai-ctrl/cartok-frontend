import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { applySessionCookie } from "@/lib/session-cookie";
import { safeNext } from "@/lib/navigation";
import { loginWithGoogle } from "@/lib/users";
import {
  appOrigin,
  clearGoogleOauthCookieOptions,
  exchangeGoogleCode,
  GOOGLE_OAUTH_COOKIE,
  googleRedirectUri,
  readGoogleLogin,
  sameSecret,
  verifyGoogleIdToken,
} from "@/lib/google-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = appOrigin(request);
  const jar = await cookies();
  const pending = readGoogleLogin(jar.get(GOOGLE_OAUTH_COOKIE)?.value);
  const next = safeNext(pending?.next ?? null);
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code") ?? "";

  if (!pending || !code || !sameSecret(pending.state, state) || url.searchParams.get("error")) {
    return fail(origin, next);
  }

  try {
    const idToken = await exchangeGoogleCode({
      code,
      verifier: pending.verifier,
      redirectUri: googleRedirectUri(origin),
    });
    const identity = idToken ? await verifyGoogleIdToken(idToken) : null;
    if (!identity) return fail(origin, next);

    const result = await loginWithGoogle(identity);
    if (!result.ok) return fail(origin, next);

    const response = NextResponse.redirect(new URL(next, origin));
    applySessionCookie(response, result.user.id);
    response.cookies.set(GOOGLE_OAUTH_COOKIE, "", clearGoogleOauthCookieOptions());
    return response;
  } catch (error) {
    console.error("google login", error);
    return fail(origin, next);
  }
}

function fail(origin: string, next: string) {
  const login = new URL("/login", origin);
  login.searchParams.set("next", next);
  login.searchParams.set("error", "google");
  const response = NextResponse.redirect(login);
  response.cookies.set(GOOGLE_OAUTH_COOKIE, "", clearGoogleOauthCookieOptions());
  return response;
}
