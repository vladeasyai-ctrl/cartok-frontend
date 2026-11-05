"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Field, fieldClass, PageShell, TextLink } from "@/components/page-shell";
import { safeNext } from "@/lib/navigation";
import { parseLogin, parseRegister } from "@/lib/validate";
import type { PublicUser } from "@/lib/types";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, setUser } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = isRegister
      ? parseRegister({ name, email, password })
      : parseLogin({ email, password });
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { user?: PublicUser; error?: string };
      if (!response.ok || !data.user) {
        setError(data.error ?? "Не удалось войти");
        return;
      }
      setUser(data.user);
      router.push(next);
      router.refresh();
    } catch {
      setError("Нет связи с сервером");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title={isRegister ? "Регистрация" : "Вход"} hideAccount>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-white/60">
          Объявления о машинах листаются как рилсы: одно объявление на весь экран, фото сменяются сами.
        </p>
        {isRegister ? (
          <Field label="Имя">
            <input
              className={fieldClass}
              value={name}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
        ) : (
          <p className="rounded-2xl bg-white/5 px-3 py-3 text-sm text-white/70">
            Демо-аккаунт: demo@cartok.dev
            <br />
            пароль: demo1234
          </p>
        )}
        <Field label="Email">
          <input
            className={fieldClass}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Пароль">
          <input
            className={fieldClass}
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Секунду…" : isRegister ? "Создать аккаунт" : "Войти"}
        </button>
        <p className="text-sm text-white/60">
          {isRegister ? (
            <>
              Уже есть аккаунт? <TextLink href={`/login?next=${encodeURIComponent(next)}`}>Войти</TextLink>
            </>
          ) : (
            <>
              Нет аккаунта?{" "}
              <TextLink href={`/register?next=${encodeURIComponent(next)}`}>Регистрация</TextLink>
            </>
          )}
        </p>
      </form>
    </PageShell>
  );
}
