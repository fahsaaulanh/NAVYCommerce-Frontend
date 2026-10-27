import Link from "next/link";
import type { Category } from "@/features/categories/types";
import RefreshButton from "@/components/ui/RefreshButton";
import CategoryIcon from "./CategoryIcon";
import styles from "./home.module.css";

type HomeCategoriesProps = {
  categories: Category[];
  unavailable: boolean;
};

export default function HomeCategories({ categories, unavailable }: HomeCategoriesProps) {
  if (!categories.length) {
    return (
      <section className={styles.categorySection} aria-labelledby="home-categories">
        <div className={styles.sectionHeading}><h2 id="home-categories">Kategori</h2></div>
        <div className={styles.categoryState} role="status">
        <p>{unavailable ? "Kategori belum dapat dimuat." : "Belum ada kategori tersedia."}</p>
        {unavailable && <RefreshButton label="Coba kembali" />}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.categorySection} aria-labelledby="home-categories">
      <div className={styles.sectionHeading}><h2 id="home-categories">Kategori</h2></div>
      <nav className={styles.categoryMenu} aria-label="Kategori produk" tabIndex={0}>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`/products?categoryId=${category.id}`}>
              <span className={styles.categoryImage}><CategoryIcon name={category.name} /></span>
              <span className={styles.categoryName}>{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      </nav>
    </section>
  );
}
