import { parseSeenParam, preferUnseen } from "@/lib/feed-rank";
import { listListings } from "@/lib/listings";

export async function GET(request: Request) {
  const seen = parseSeenParam(new URL(request.url).searchParams.get("seen"));
  const listings = await listListings();
  return Response.json({ listings: preferUnseen(listings, seen) });
}
