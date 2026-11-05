import { findUserById, toPublic } from "@/lib/users";
import { readSessionUserId } from "@/lib/session-cookie";

export async function GET() {
  const userId = await readSessionUserId();
  if (!userId) return Response.json({ user: null }, { status: 401 });

  const user = await findUserById(userId);
  if (!user) return Response.json({ user: null }, { status: 401 });

  return Response.json({ user: toPublic(user) });
}
