import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Retail Agent",
  description: "Mobile-first QR retail product assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-950">
        <div className="min-h-full w-full flex justify-center">
          <div className="w-full max-w-[420px] min-h-full flex flex-col">
            <header className="px-4 pt-4 pb-2 flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-black/5 px-3 py-2 shadow-sm"
                aria-label="Language"
              >
                <span aria-hidden className="text-lg leading-none">
                  🌐
                </span>
                <span className="text-sm font-medium">EN</span>
              </button>
              <div className="text-sm font-semibold tracking-tight text-zinc-900">
                In-store assistant
              </div>
              <div className="w-[58px]" />
            </header>
            <main className="flex-1 px-4 pb-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
