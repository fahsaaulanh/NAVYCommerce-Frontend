import type { ReactNode } from "react";
import MarketplaceNavbar from "@/components/layout/MarketplaceNavbar";
import MarketplaceFooter from "@/components/layout/MarketplaceFooter";
import { getSession } from "@/lib/auth/session";
import { getCatalogCategories } from "@/features/products/api/catalog-api";
import type { CatalogCategory } from "@/features/products/types/public-types";
export default async function ProductsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, categoriesResult] = await Promise.all([
    getSession(),
    getCatalogCategories()
      .then((data) => ({ data }))
      .catch(() => ({ data: [] as CatalogCategory[] })),
  ]);
  return (
    <>
      <MarketplaceNavbar user={user} categories={categoriesResult.data} />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
      <MarketplaceFooter />
    </>
  );
}
