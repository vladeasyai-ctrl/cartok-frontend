import { Suspense } from "react";
import { ListingScreen } from "@/components/reels/listing-screen";

export const metadata = { title: "Объявление" };

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="h-full">
      <Suspense fallback={<div className="h-full bg-black" />}>
        <ListingLoader params={params} />
      </Suspense>
    </div>
  );
}

async function ListingLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingScreen id={id} />;
}
