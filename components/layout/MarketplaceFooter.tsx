import Link from "next/link";
import Brand from "@/components/brand/Brand";
import Icon from "@/components/ui/Icon";
import { getSession } from "@/lib/auth/session";
import styles from "./marketplace.module.css";

export default async function MarketplaceFooter() {
  const user = await getSession();
  return <footer className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}><Link href="/" aria-label="NAVYCommerce — beranda"><Brand /></Link>
          <p className={styles.footerAbout}>Belanja produk dari berbagai toko. Pilih varian dan layanan pengiriman sesuai kebutuhanmu.</p>
          <Link href="/products" className={styles.footerExplore}>Jelajahi katalog<Icon name="arrow-right" /></Link>
        </div>
        <div><h2>Jelajahi</h2><nav aria-label="Jelajahi marketplace"><Link href="/">Beranda</Link><Link href="/products">Semua produk</Link><Link href="/products?sort=newest">Produk terbaru</Link><Link href="/products?inStock=true">Stok tersedia</Link></nav></div>
        <div><h2>Akun & aktivitas</h2><nav aria-label="Akun dan aktivitas"><Link href="/account">Akun saya</Link>
          {user?.role === "Customer" && <><Link href="/cart">Keranjang belanja</Link><Link href="/orders">Pesanan terakhir</Link><Link href="/account/addresses">Alamat pengiriman</Link></>}
          {user?.role === "Seller" && <><Link href="/seller">Seller Center</Link><Link href="/seller/stores">Toko saya</Link></>}
          {!user && <Link href="/auth">Masuk atau daftar</Link>}
        </nav></div>
        <div className={styles.footerDemo}><span>VERSI DEMO</span><h2>Demo portofolio</h2><p>Coba katalog, keranjang, dan pembuatan pesanan. Pembayaran serta pengiriman barang sungguhan tidak tersedia.</p></div>
      </div>
      <div className={styles.footerBottom}><span>© {new Date().getFullYear()} NAVYCommerce.</span><span>Marketplace dari berbagai toko.</span></div>
    </div>
  </footer>;
}
