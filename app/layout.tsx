import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAVYCommerce",
  description: "Multi Vendor Ecommerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3"
        >
          Lewati navigasi
        </a>

        {children}
      </body>
    </html>
  );
}