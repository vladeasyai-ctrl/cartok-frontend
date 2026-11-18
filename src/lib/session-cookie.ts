import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  readSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from "@/lib/session-token";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export async function setSessionCookie(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(userId), cookieOptions);
}

/** Для ответа-редиректа: cookie(), выставленная рядом с NextResponse.redirect, может не уехать. */
export function applySessionCookie(response: NextResponse, userId: string) {
  response.cookies.set(SESSION_COOKIE, signSession(userId), cookieOptions);
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function readSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value)?.sub ?? null;
}
