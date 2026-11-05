import { AccountScreen } from "@/components/account-screen";

export const metadata = { title: "Профиль" };

export default function MePage() {
  return (
    <div className="h-full">
      <AccountScreen />
    </div>
  );
}
