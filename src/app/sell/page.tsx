import { SellForm } from "@/components/sell-form";

export const metadata = { title: "Новое объявление" };

export default function SellPage() {
  return (
    <div className="h-full">
      <SellForm />
    </div>
  );
}
