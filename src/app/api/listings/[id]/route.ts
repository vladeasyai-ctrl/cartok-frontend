import { getListing } from "@/lib/listings";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const listing = await getListing(id);
  if (!listing) return Response.json({ error: "Объявление не найдено" }, { status: 404 });
  return Response.json({ listing });
}
