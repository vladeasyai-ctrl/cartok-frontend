import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Регистрация" };

export default function RegisterPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<div className="h-full bg-black" />}>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
