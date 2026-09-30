"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Brand from "@/components/brand/Brand";

const links = [{ href: "/", label: "Beranda" }, { href: "/products", label: "Produk" }];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="relative z-20 shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="NAVYCommerce — beranda" onClick={() => setOpen(false)}><Brand /></Link>
        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
          {links.map(link => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? 'text-primary' : 'text-muted'}`}>
              {link.label}
            </Link>
          ))}
          <span aria-hidden="true" className="h-5 w-px bg-border" />
          <Link href="/auth" aria-current={isActive('/auth') ? 'page' : undefined}
            className="action-button">
            Masuk
          </Link>
        </nav>
        <button type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setOpen(!open)} className="flex size-11 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-background md:hidden">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      <nav id="mobile-navigation" aria-label="Navigasi ponsel" hidden={!open} className="border-t border-border px-4 py-3 md:hidden"
        onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
        {[...links, { href: '/auth', label: 'Masuk' }].map(link => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={isActive(link.href) ? 'page' : undefined}
            className={`block rounded-xl px-3 py-3 text-sm font-medium hover:bg-background ${isActive(link.href) ? 'text-primary' : 'text-muted'}`}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
