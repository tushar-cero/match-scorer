import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Match Scorer",
  description: "Tournament & match scoring — local-first",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f6f5f2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body
        style={{
          fontFamily:
            "var(--font-geist), -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        }}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
