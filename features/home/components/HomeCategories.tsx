import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { formatNumber } from "@/lib/format";
import type { CatalogCategory } from "@/features/products/types/public-types";
import styles from "./home.module.css";

export default function HomeCategories({ categories, unavailable }: { categories: CatalogCategory[]; unavailable: boolean }) {
  const displayed = [...categories].sort((a,b) => b.productCount-a.productCount || a.name.localeCompare(b.name, "id")).slice(0,8);
  return <section className={styles.section} aria-labelledby="home-categories">
    <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>MULAI DARI YANG KAMU SUKA</p><h2 id="home-categories">Belanja berdasarkan kategori</h2></div>
      <Link href="/products" className={styles.moreLink}>Semua produk<Icon name="arrow-right" /></Link></div>
    {displayed.length ? <ul className={styles.categories}>{displayed.map((category, index) => <li key={category.id}>
      <Link href={`/products?categoryId=${category.id}`} className={styles.categoryCard}>
        <span className={styles.categoryIcon}><Icon name={index % 3 === 0 ? "box" : index % 3 === 1 ? "grid" : "store"} /></span>
        <strong>{category.name}</strong><span>{formatNumber(category.productCount)} produk</span>
        <Icon name="arrow-right" className={styles.categoryArrow} />
      </Link></li>)}</ul> : <p className={styles.quietState} role="status">{unavailable ? "Kategori belum dapat dimuat. Kamu tetap dapat membuka katalog produk." : "Kategori akan tampil saat tersedia di katalog."}</p>}
  </section>;
}
