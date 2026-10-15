import Link from "next/link";
import Brand from "@/components/brand/Brand";
import styles from "./marketplace.module.css";
export default function MarketplaceFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" aria-label="NAVYCommerce — beranda">
              <Brand />
            </Link>
            <p className={styles.footerAbout}>
              Pilihan produk dari berbagai toko, dalam satu tempat. Temukan
              kebutuhanmu dan ruang baru untuk mengembangkan usaha.
            </p>
          </div>
          <div>
            <h2>Jelajahi NAVYCommerce</h2>
            <nav aria-label="Jelajahi marketplace">
              <Link href="/products">Semua produk</Link>
              <Link href="/products?inStock=true">Produk tersedia</Link>
              <Link href="/products?sort=newest">Produk terbaru</Link>
              <Link href="/">Beranda</Link>
            </nav>
          </div>
          <div>
            <h2>Akun & usaha</h2>
            <nav aria-label="Akun dan usaha">
              <Link href="/account">Akun saya</Link>
              <Link href="/auth">Masuk atau daftar</Link>
              <Link href="/seller">Seller Center</Link>
              <Link href="/seller/stores">Kelola toko</Link>
            </nav>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} NAVYCommerce.</span>
          <span>Ruang belanja dan tumbuh bersama.</span>
        </div>
      </div>
    </footer>
  );
}
