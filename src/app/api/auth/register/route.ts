import { registerUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/session-cookie";
import { parseRegister } from "@/lib/validate";

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = parseRegister(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const result = await registerUser(parsed.data);
  if (!result.ok) return Response.json({ error: result.error }, { status: 409 });

  await setSessionCookie(result.user.id);
  return Response.json({ user: result.user }, { status: 201 });
}
