import { findUserById } from "@/lib/users";
import { readSessionUserId } from "@/lib/session-cookie";

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return Response.json({ user: null }, { status: 401 });

  try {
    const user = await findUserById(userId);
    if (!user) return Response.json({ user: null }, { status: 401 });
    return Response.json({ user });
  } catch (error) {
    console.error("me", error);
    return Response.json({ error: "Профиль временно недоступен" }, { status: 502 });
  }
}
