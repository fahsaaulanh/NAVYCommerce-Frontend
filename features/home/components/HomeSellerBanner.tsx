import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { SessionUser } from "@/lib/auth/session";
import styles from "./home.module.css";

export default function HomeSellerBanner({ user }: { user: SessionUser | null }) {
  const seller = user?.role === "Seller";
  return <section className={styles.sellerBanner} aria-labelledby="home-seller">
    <span className={styles.sellerIcon}><Icon name="store" /></span>
    <div><p className={styles.eyebrow}>RUANG UNTUK USAHAMU</p><h2 id="home-seller">Produkmu punya cerita. Bagikan di sini.</h2>
      <p>{seller ? "Kelola toko, lengkapi produk, dan hadirkan pilihan baru untuk pelangganmu." : "Kenali ruang Seller NAVYCommerce untuk mengelola toko dan menampilkan produkmu."}</p></div>
    <Link href={seller ? "/seller/stores" : user ? "/account" : "/auth"} className="action-button action-button--outline">
      {seller ? "Kelola toko" : user ? "Buka akunmu" : "Mulai dari akunmu"}<Icon name="arrow-right" />
    </Link>
  </section>;
}
