import { loginUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/session-cookie";
import { parseLogin } from "@/lib/validate";

export async function POST(request: Request) {
  const body = await readBody(request);
  const parsed = parseLogin(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  let user;
  try {
    user = await loginUser(parsed.data);
  } catch (error) {
    console.error("login", error);
    return Response.json({ error: "Вход временно недоступен" }, { status: 502 });
  }
  if (!user) return Response.json({ error: "Неверный email или пароль" }, { status: 401 });

  await setSessionCookie(user.id);
  return Response.json({ user });
}

async function readBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
