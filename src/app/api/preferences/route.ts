import { loadPreferences, savePreferences } from "@/lib/preferences";
import { readSessionUserId } from "@/lib/session-cookie";
import { parsePreferences } from "@/lib/validate";

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return Response.json({ error: "Нужно войти" }, { status: 401 });
  try {
    const preferences = await loadPreferences(userId);
    if (!preferences) return Response.json({ error: "Нужно войти" }, { status: 401 });
    return Response.json({ preferences });
  } catch (error) {
    console.error("preferences", error);
    return Response.json({ error: "Предпочтения временно недоступны" }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const userId = await readSessionUserId();
  if (!userId) return Response.json({ error: "Нужно войти" }, { status: 401 });

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = parsePreferences(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const result = await savePreferences(userId, parsed.data);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status === 404 ? 401 : 400 });
    }
    return Response.json({ preferences: result.preferences });
  } catch (error) {
    console.error("preferences save", error);
    return Response.json({ error: "Не удалось сохранить, попробуйте позже" }, { status: 502 });
  }
}
