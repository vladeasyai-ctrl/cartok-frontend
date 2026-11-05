import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<div className="h-full bg-black" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
