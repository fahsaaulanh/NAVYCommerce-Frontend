import Link from "next/link";
import Brand from "@/components/brand/Brand";

export default function Footer() {
  return (
    <footer className="shrink-0 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link href="/" aria-label="NAVYCommerce — beranda"><Brand /></Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">Ruang untuk menemukan produk dan mengembangkan usaha.</p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <nav aria-label="Navigasi footer" className="flex gap-6 text-sm font-medium text-muted">
            <Link href="/" className="hover:text-primary">Beranda</Link>
            <Link href="/products" className="hover:text-primary">Produk</Link>
            <Link href="/auth" className="hover:text-primary">Akun</Link>
          </nav>
          <p className="text-xs text-muted">© {new Date().getFullYear()} NAVYCommerce.</p>
        </div>
      </div>
    </footer>
  );
}
