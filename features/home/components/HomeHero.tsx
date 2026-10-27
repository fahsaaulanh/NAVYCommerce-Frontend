import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import styles from "./home.module.css";

export default function HomeHero() {
  return (
    <section className={styles.banners} aria-label="Banner belanja">
      <div className={styles.mainBanner}>
        <div aria-hidden="true" className={styles.bannerOrnaments}><i /><i /><i /></div>
        <div className={styles.bannerCopy}>
          <span className={styles.bannerEyebrow}>Pilihan dari berbagai toko</span>
          <h1>Belanja kebutuhanmu</h1>
          <Link href="/products" className="action-button action-button--sm">Lihat produk<Icon name="arrow-right" /></Link>
        </div>
        <div className={styles.bannerImage}>
          <Image src="/images/home/marketplace-collection.webp" alt="Pilihan produk NAVYCommerce" fill preload unoptimized sizes="(max-width: 640px) 60vw, 45vw" className="object-cover" />
          <span aria-hidden="true" className={styles.imageCorner}><Icon name="store" /></span>
        </div>
      </div>
      <div className={styles.sideBanners}>
        <Link href="/products?sort=newest" className={`${styles.smallBanner} ${styles.newBanner}`}>
          <span aria-hidden="true" className={styles.promoArt}><Icon name="grid" /><i /></span>
          <strong>Produk terbaru</strong>
          <span className={styles.bannerLink}>Lihat produk<Icon name="arrow-right" /></span>
        </Link>
        <Link href="/products?inStock=true" className={`${styles.smallBanner} ${styles.stockBanner}`}>
          <span aria-hidden="true" className={styles.promoArt}><Icon name="box" /><i /></span>
          <strong>Stok tersedia</strong>
          <span className={styles.bannerLink}>Belanja sekarang<Icon name="arrow-right" /></span>
        </Link>
      </div>
    </section>
  );
}
