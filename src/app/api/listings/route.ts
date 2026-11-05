import { createListing, listListings } from "@/lib/listings";
import { findUserById, toPublic } from "@/lib/users";
import { readSessionUserId } from "@/lib/session-cookie";
import { parseListing } from "@/lib/validate";

export async function GET() {
  try {
    return Response.json({ listings: await listListings() });
  } catch (error) {
    console.error("listings", error);
    return Response.json({ error: "Каталог недоступен" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const userId = await readSessionUserId();
  const stored = userId ? await findUserById(userId) : null;
  if (!stored) return Response.json({ error: "Нужно войти" }, { status: 401 });

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = parseListing(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const listing = await createListing(parsed.data, toPublic(stored));
  return Response.json({ listing }, { status: 201 });
}
