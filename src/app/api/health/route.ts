import { connection } from "next/server";
import { pingBackend, WAKE_TIMEOUT_MS } from "@/lib/backend";

export const maxDuration = 60;

export async function GET(request: Request) {
  await connection();
  const requested = Number(new URL(request.url).searchParams.get("timeoutMs"));
  const timeoutMs = Number.isFinite(requested)
    ? Math.min(WAKE_TIMEOUT_MS, Math.max(1000, requested))
    : WAKE_TIMEOUT_MS;
  const ok = await pingBackend(timeoutMs, request.signal);
  return Response.json({ ok }, { status: ok ? 200 : 503 });
}
