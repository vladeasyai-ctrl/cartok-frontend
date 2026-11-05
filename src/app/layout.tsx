import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "cartok",
    template: "%s — cartok",
  },
  description: "Объявления о продаже машин в формате рилсов",
  applicationName: "cartok",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${sans.variable} h-full`}>
      <body className="min-h-full bg-zinc-900 font-sans text-zinc-50 antialiased">
        <div className="mx-auto h-dvh w-full max-w-[480px] overflow-hidden bg-black sm:border-x sm:border-white/10">
          <SessionProvider>{children}</SessionProvider>
        </div>
      </body>
    </html>
  );
}
