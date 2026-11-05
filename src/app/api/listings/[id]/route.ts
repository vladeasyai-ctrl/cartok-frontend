import { getListing } from "@/lib/listings";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const listing = await getListing(id);
    if (!listing) return Response.json({ error: "Объявление не найдено" }, { status: 404 });
    return Response.json({ listing });
  } catch (error) {
    console.error("listing", error);
    return Response.json({ error: "Объявление недоступно" }, { status: 502 });
  }
}
