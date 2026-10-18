import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import styles from "./home.module.css";

export default function HomeHero() {
  return <section className={styles.heroLayout} aria-labelledby="home-title">
    <div className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span />TEMUKAN PILIHANMU</p>
        <h1 id="home-title">Hal kecil.<br />Banyak cerita.</h1>
        <p className={styles.heroDescription}>Dari kebutuhan sehari-hari sampai hadiah untuk orang tersayang. Temukan pilihanmu dari berbagai toko di NAVYCommerce.</p>
        <Link href="/products" className="action-button action-button--primary">Jelajahi produk<Icon name="arrow-right" /></Link>
        <p className={styles.heroNote}>Satu tempat untuk beragam pilihan.</p>
      </div>
      <div className={styles.heroPhoto}>
        <Image src="/images/home/marketplace-collection.webp" alt="Ilustrasi pilihan belanja: buket bunga, pakaian, tas, sepatu, dan buku catatan"
          fill preload unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 40vw" className="object-cover" />
        <span className={styles.photoCaption}>Untuk keseharian & momen istimewa</span>
      </div>
    </div>
    <div className={styles.sideCards}>
      <Link href="/products?inStock=true" className={`${styles.sideCard} ${styles.warmCard}`}>
        <span className={styles.sideIcon}><Icon name="box" /></span>
        <span className={styles.smallLabel}>SIAP DIPILIH</span><h2>Cari yang pas<br />untuk harimu.</h2>
        <span className={styles.cardAction}>Lihat stok tersedia<Icon name="arrow-right" /></span>
      </Link>
      <Link href="/products?sort=newest" className={`${styles.sideCard} ${styles.coolCard}`}>
        <span className={styles.sideIcon}><Icon name="grid" /></span>
        <span className={styles.smallLabel}>BARU DI KATALOG</span><h2>Pilihan baru,<br />inspirasi baru.</h2>
        <span className={styles.cardAction}>Jelajahi yang terbaru<Icon name="arrow-right" /></span>
      </Link>
    </div>
  </section>;
}
