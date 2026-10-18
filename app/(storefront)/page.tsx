import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { loadHomeData } from "@/features/home/api/home-data";
import HomeHero from "@/features/home/components/HomeHero";
import HomeBenefits from "@/features/home/components/HomeBenefits";
import HomeCategories from "@/features/home/components/HomeCategories";
import HomeProducts from "@/features/home/components/HomeProducts";
import HomeSellerBanner from "@/features/home/components/HomeSellerBanner";
import styles from "@/features/home/components/home.module.css";

export const metadata: Metadata = {
  title: "NAVYCommerce — Temukan Pilihanmu",
  description: "Jelajahi produk dari berbagai toko. Temukan kebutuhan sehari-hari, pilihan gaya, dan hadiah untuk momen istimewa di NAVYCommerce.",
};

export default async function HomePage() {
  const [data, user] = await Promise.all([loadHomeData(), getSession()]);
  return <div className={styles.page}>
    <HomeHero /><HomeBenefits />
    <HomeCategories categories={data.categories} unavailable={data.categoriesUnavailable} />
    <HomeProducts products={data.products} unavailable={data.productsUnavailable} />
    <HomeSellerBanner user={user} />
  </div>;
}
