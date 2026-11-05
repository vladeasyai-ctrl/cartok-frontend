import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg">Страница не найдена</p>
      <Link href="/" className="text-sm text-amber-300">
        К ленте
      </Link>
    </div>
  );
}
