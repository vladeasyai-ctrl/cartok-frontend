import { clearSessionCookie } from "@/lib/session-cookie";

export async function POST() {
  await clearSessionCookie();
  return Response.json({ ok: true });
}
