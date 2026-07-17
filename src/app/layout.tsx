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
  title: "QUTU // Tasarım Sistemli Fotoğraf Kabini",
  description: "Qutu Tasarım Sistemi ile tasarlanmış profesyonel self-servis fotoğraf kabini. Filigran damgalarını seçin, aydınlatmayı özelleştirin ve premium polaroid baskılar alın.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-white selection:bg-volt selection:text-black">{children}</body>
    </html>
  );
}


