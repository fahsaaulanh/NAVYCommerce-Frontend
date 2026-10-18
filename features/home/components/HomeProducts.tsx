import Link from "next/link";
import Icon from "@/components/ui/Icon";
import PublicProductCard from "@/features/products/components/catalog/PublicProductCard";
import type { PublicProductSummary } from "@/features/products/types/public-types";
import styles from "./home.module.css";

export default function HomeProducts({
  products,
  unavailable,
}: {
  products: PublicProductSummary[];
  unavailable: boolean;
}) {
  return (
    <section className={styles.section} aria-labelledby="home-products">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>ADA YANG BARU UNTUKMU</p>
          <h2 id="home-products">Baru di NAVYCommerce</h2>
          <p>
            Produk terbaru dengan stok tersedia, langsung dari katalog toko.
          </p>
        </div>
        <Link href="/products?sort=newest" className={styles.moreLink}>
          Lihat semua
          <Icon name="arrow-right" />
        </Link>
      </div>
      {products.length ? (
        <ul className={styles.products}>
          {products.map((product) => (
            <li key={product.id}>
              <PublicProductCard product={product} headingLevel={3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <span>
            <Icon name="box" className="size-7" />
          </span>
          <h3>
            {unavailable
              ? "Produk belum dapat dimuat"
              : "Pilihan baru sedang disiapkan"}
          </h3>
          <p role="status">
            {unavailable
              ? "Coba muat ulang halaman atau kunjungi katalog beberapa saat lagi."
              : "Produk dengan stok tersedia akan muncul di sini setelah dipublikasikan toko."}
          </p>
          {unavailable ? (
            <a href="/" className="action-button action-button--outline">
              Muat ulang beranda
            </a>
          ) : (
            <Link
              href="/products"
              className="action-button action-button--outline"
            >
              Buka katalog
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
