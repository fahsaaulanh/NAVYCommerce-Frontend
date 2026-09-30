import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "NAVYCommerce",
  description: "Multi Vendor Ecommerce Platform",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3">Lewati navigasi</a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
