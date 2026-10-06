"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Brand from "@/components/brand/Brand";
import LogoutButton from "@/features/auth/LogoutButton";

type SellerShellProps = {
  fullName: string;
  children: ReactNode;
};

const navigation = [
  { href: "/seller", label: "Ringkasan", icon: "dashboard" },
  { href: "/seller/stores", label: "Toko Saya", icon: "store" },
] as const;

function NavigationIcon({
  kind,
}: {
  kind: "dashboard" | "store";
}) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "dashboard" ? (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      ) : (
        <>
          <path d="M3 10h18l-2-6H5l-2 6Z" />
          <path d="M5 10v10h14V10M9 20v-6h6v6" />
        </>
      )}
    </svg>
  );
}

export default function SellerShell({
  fullName,
  children,
}: SellerShellProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/seller"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-dvh w-full flex-1">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <Link
          href="/seller"
          aria-label="NAVYCommerce Seller Center"
          className="flex min-h-24 items-center px-6"
        >
          <Brand />
        </Link>

        <div className="px-6 pb-6">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Seller Center
          </span>
        </div>

        <nav
          aria-label="Navigasi seller"
          className="space-y-2 px-4"
        >
          {navigation.map(item => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                isActive(item.href) ? "page" : undefined
              }
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <NavigationIcon kind={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border p-5">
          <Link
            href="/"
            className="block rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-primary"
          >
            Kembali ke beranda
          </Link>

          <Link
            href="/account"
            className="block rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-primary"
          >
            Akun Saya
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/seller"
              className="text-sm font-semibold text-foreground"
            >
              NAVYCommerce{" "}
              <span className="text-muted">Seller Center</span>
            </Link>

            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/account"
                className="hidden max-w-48 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-background sm:flex"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                >
                  {Array.from(fullName)[0]?.toUpperCase()}
                </span>

                <span className="truncate text-sm font-medium">
                  {fullName}
                </span>
              </Link>

              <LogoutButton />
            </div>
          </div>

          <nav
            aria-label="Navigasi seller ponsel"
            className="flex gap-2 overflow-x-auto border-t border-border px-4 py-3 lg:hidden"
          >
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isActive(item.href) ? "page" : undefined
                }
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-background"
                }`}
              >
                <NavigationIcon kind={item.icon} />
                {item.label}
              </Link>
            ))}

            <Link
              href="/account"
              className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-background"
            >
              Akun Saya
            </Link>
          </nav>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1"
        >
          {children}
        </main>

        <footer className="border-t border-border px-4 py-5 text-xs text-muted sm:px-6 lg:px-8">
          NAVYCommerce · Seller Center
        </footer>
      </div>
    </div>
  );
}