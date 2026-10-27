import Link from "next/link";
import RefreshButton from "@/components/ui/RefreshButton";
import Icon from "@/components/ui/Icon";
import PublicProductCard from "@/features/products/components/catalog/PublicProductCard";
import type { PublicProductSummary } from "@/features/products/types/public-types";
import styles from "./home.module.css";
export default function HomeProducts({ id, title, products, unavailable, centered=false }: { id:string; title:string; products:PublicProductSummary[]; unavailable:boolean; centered?:boolean }) {
  return <section className={styles.section} aria-labelledby={id}>
    <div className={`${styles.sectionHeading} ${centered ? styles.centeredHeading : ""}`}><h2 id={id}>{title}</h2>{!centered && <Link href="/products" className={styles.moreLink}>Lihat semua<Icon name="arrow-right" /></Link>}</div>
    {products.length ? <ul className={styles.products}>{products.slice(0,12).map(product => <li key={product.id}><PublicProductCard product={product} headingLevel={3} /></li>)}</ul>
      : <div className={styles.empty}><p role="status">{unavailable ? "Produk belum dapat dimuat." : "Belum ada produk tersedia."}</p>{unavailable && <RefreshButton label="Coba kembali" />}</div>}
  </section>;
}
