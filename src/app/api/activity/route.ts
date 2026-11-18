import { recordActivity } from "@/lib/backend";
import { readSessionUserId } from "@/lib/session-cookie";
import { parseActivity } from "@/lib/validate";

/** Принимает и fetch, и navigator.sendBeacon: тело в обоих случаях JSON. */
export async function POST(request: Request) {
  const userId = await readSessionUserId();
  if (!userId) return Response.json({ error: "Нужно войти" }, { status: 401 });

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = parseActivity(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    return Response.json({ recorded: await recordActivity(userId, parsed.data) });
  } catch (error) {
    console.error("activity", error);
    return Response.json({ error: "Не удалось записать" }, { status: 502 });
  }
}
