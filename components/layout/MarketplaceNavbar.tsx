import Link from "next/link";
import { Suspense } from "react";
import CartLink from "@/features/cart/components/CartLink";
import Brand from "@/components/brand/Brand";
import Icon from "@/components/ui/Icon";
import LogoutButton from "@/features/auth/LogoutButton";
import type { SessionUser } from "@/lib/auth/session";
import type { CatalogCategory } from "@/features/products/types/public-types";
import CatalogSearch from "./CatalogSearch";
import styles from "./marketplace.module.css";
type Props = { user: SessionUser | null; categories: CatalogCategory[]; cartQuantity: number | null };
export default function MarketplaceNavbar({ user, categories, cartQuantity }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.topline}>
        <div className={`${styles.container} ${styles.toplineInner}`}>
          <span>Temukan pilihanmu. Dukung usaha lokal.</span>
          <Link href={user?.role === "Seller" ? "/seller" : "/auth"}>
            {user?.role === "Seller" ? "Seller Center" : "Akun merchant"}
          </Link>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.mainbar}>
          <Link href="/" aria-label="NAVYCommerce — beranda">
            <Brand />
          </Link>
          <div className={styles.searchSlot}>
            <Suspense
              fallback={<div className="h-12 rounded-xl bg-background" />}
            >
              <CatalogSearch />
            </Suspense>
          </div>
          <div className={styles.account}>
            <CartLink role={user?.role ?? null} quantity={cartQuantity} />
            <Link
              href={user ? "/account" : "/auth"}
              className={styles.accountLink}
              aria-label={
                user ? `Buka akun ${user.fullName}` : "Masuk atau daftar"
              }
            >
              <span className={styles.accountIcon}>
                <Icon name="user" />
              </span>
              <span className={styles.accountText}>
                <small>
                  {user ? "Selamat datang" : "Halo, selamat datang"}
                </small>
                {user ? user.fullName : "Masuk / Daftar"}
              </span>
            </Link>
            {user && (
              <span className={styles.logout}>
                <LogoutButton />
              </span>
            )}
          </div>
        </div>
        <nav aria-label="Navigasi belanja" className={styles.subnav}>
          <Link href="/products" className={styles.categoryLink}>
            <Icon name="grid" /> Semua produk
          </Link>
          <div className={styles.categoryLinks}>
            {categories
              .filter((item) => item.productCount > 0)
              .slice(0, 7)
              .map((item) => (
                <Link key={item.id} href={`/products?categoryId=${item.id}`}>
                  {item.name}
                </Link>
              ))}
            <Link href="/account">Akun saya</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
