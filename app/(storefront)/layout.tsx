import type { ReactNode } from "react";

import { getCartQuantity } from "@/features/cart/api/cart-summary";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/session";
import { getCatalogCategories } from "@/features/products/api/catalog-api";

export default async function StorefrontLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [user, categories] = await Promise.all([getSession(), getCatalogCategories().catch(() => [])]);
  const cartQuantity = await getCartQuantity(user);

  return (
    <>
      <Navbar user={user} cartQuantity={cartQuantity} categories={categories} />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col"
      >
        {children}
      </main>

      <Footer />
    </>
  );
}