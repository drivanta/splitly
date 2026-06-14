import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "splitly",
  description: "Split bills with friends. No login. Just a shareable link.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-cream text-brand-navy">
        {children}
      </body>
    </html>
  );
}
