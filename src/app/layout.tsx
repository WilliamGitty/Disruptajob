import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { HeaderShell } from "@/components/nav/header-shell";
import { Footer } from "@/components/layout/footer";
import { DemoBanner } from "@/components/layout/demo-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const editorialSerif = Newsreader({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Disruptajob — Your job title doesn't do you justice",
  description:
    "If your CV flattens three jobs into one line, show the work instead. Build a profile from what you've actually built and let companies come to you. Free for candidates, hidden until you choose otherwise.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${editorialSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <DemoBanner />
        <HeaderShell />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
