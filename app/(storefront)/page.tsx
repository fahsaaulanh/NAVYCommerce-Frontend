import type { Metadata } from "next";
import { loadHomeData } from "@/features/home/api/home-data";
import HomeHero from "@/features/home/components/HomeHero";
import HomeCategories from "@/features/home/components/HomeCategories";
import HomeProducts from "@/features/home/components/HomeProducts";
import styles from "@/features/home/components/home.module.css";
export const metadata:Metadata = {
  title:"NAVYCommerce | Belanja online",
  description:"Temukan produk dari berbagai toko di NAVYCommerce.",
};
export default async function HomePage() {
  const data = await loadHomeData();
  return <div className={styles.page}>
    <HomeHero />
    <HomeCategories categories={data.categories} unavailable={data.categoriesUnavailable} />
    <HomeProducts id="best-sellers" title="Produk terlaris" products={data.products} unavailable={data.productsUnavailable} />
    <HomeProducts id="recommendations" title="Rekomendasi" centered products={data.products} unavailable={data.productsUnavailable} />
  </div>;
}
