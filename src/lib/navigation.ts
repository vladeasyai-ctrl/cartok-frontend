/** Разрешаем только внутренние пути, чтобы параметр next не уводил на чужой сайт. */
export function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  if (value.startsWith("/login") || value.startsWith("/register")) return "/";
  return value;
}
