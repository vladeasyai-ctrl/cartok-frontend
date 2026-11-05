import { findUserByEmail, toPublic, verifyPassword } from "@/lib/users";
import { setSessionCookie } from "@/lib/session-cookie";
import { parseLogin } from "@/lib/validate";

export async function POST(request: Request) {
  const body = await readBody(request);
  const parsed = parseLogin(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const user = await findUserByEmail(parsed.data.email);
  // Считаем хеш и для несуществующего email, чтобы по времени ответа не было видно, есть ли аккаунт.
  const valid = await verifyPassword(
    parsed.data.password,
    user?.passwordHash ?? `${"aa".repeat(16)}:${"bb".repeat(64)}`,
  );
  if (!user || !valid) {
    return Response.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  await setSessionCookie(user.id);
  return Response.json({ user: toPublic(user) });
}

async function readBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
