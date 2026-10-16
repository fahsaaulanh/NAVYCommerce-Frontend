"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import CartLink from "@/features/cart/components/CartLink";
import Brand from "@/components/brand/Brand";
import LogoutButton from "@/features/auth/LogoutButton";
import type { SessionUser } from "@/lib/auth/session";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
];

type NavbarProps = {
  user: SessionUser | null;
  cartQuantity: number | null;
};

function UserIdentity({ user }: { user: SessionUser }) {
  return (
    <Link
      href="/account"
      aria-label={`Buka akun ${user.fullName}`}
      className="flex min-w-0 items-center gap-3 rounded-xl p-1 transition-colors hover:bg-primary/5"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
      >
        {user.fullName.charAt(0).toUpperCase()}
      </span>

      <span className="max-w-40 truncate text-sm font-semibold text-foreground">
        {user.fullName}
      </span>
    </Link>
  );
}

export default function Navbar({ user, cartQuantity }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const mobileLinks = user
    ? links
    : [...links, { href: "/auth", label: "Masuk" }];

  return (
    <header className="relative z-20 shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="NAVYCommerce — beranda"
          onClick={() => setOpen(false)}
        >
          <Brand />
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-6 md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                isActive(link.href) ? "page" : undefined
              }
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <span
            aria-hidden="true"
            className="h-5 w-px bg-border"
          />

          <CartLink role={user?.role ?? null} quantity={cartQuantity} />

          {user ? (
            <>
              <UserIdentity user={user} />
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/auth"
              aria-current={
                isActive("/auth") ? "page" : undefined
              }
              className="action-button"
            >
              Masuk
            </Link>
          )}
        </nav>

        <div className="ml-auto md:hidden">
          <CartLink role={user?.role ?? null} quantity={cartQuantity} />
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((previous) => !previous)}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-background md:hidden"
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Navigasi ponsel"
        hidden={!open}
        className="border-t border-border px-4 py-3 md:hidden"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        {user && (
          <div className="mb-2 border-b border-border px-3 py-3">
            <UserIdentity user={user} />
          </div>
        )}

        {mobileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={
              isActive(link.href) ? "page" : undefined
            }
            className={`block rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-background ${
              isActive(link.href)
                ? "text-primary"
                : "text-muted"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {user && (
          <div
            className="mt-3 border-t border-border px-3 pt-4"
            onSubmit={() => setOpen(false)}
          >
            <LogoutButton />
          </div>
        )}
      </nav>
    </header>
  );
}