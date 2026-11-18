import { Suspense } from "react";
import { HomeShell } from "@/components/home-shell";

export default function HomePage() {
  return (
    <div className="h-full">
      <Suspense fallback={<div className="h-full bg-black" />}>
        <HomeShell />
      </Suspense>
    </div>
  );
}
