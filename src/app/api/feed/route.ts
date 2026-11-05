import { parseSeenParam } from "@/lib/feed-rank";
import { feedListings } from "@/lib/listings";

export async function GET(request: Request) {
  const seen = parseSeenParam(new URL(request.url).searchParams.get("seen"));
  try {
    return Response.json({ listings: await feedListings(seen) });
  } catch (error) {
    console.error("feed", error);
    return Response.json({ error: "Лента недоступна" }, { status: 502 });
  }
}
