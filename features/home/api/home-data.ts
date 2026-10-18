import "server-only";
import { BackendApiError } from "@/lib/api/server";
import { catalogApi, getCatalogCategories } from "@/features/products/api/catalog-api";
import { readCatalogQuery } from "@/features/products/utils/catalog-query";

export async function loadHomeData() {
  const [products, categories] = await Promise.allSettled([
    catalogApi.getProducts(readCatalogQuery({ sort: "newest", inStock: "true" })),
    getCatalogCategories(),
  ]);
  for (const result of [products, categories]) {
    if (result.status === "rejected" && !(result.reason instanceof BackendApiError)) throw result.reason;
  }
  return {
    products: products.status === "fulfilled" ? products.value.data : [],
    categories: categories.status === "fulfilled" ? categories.value : [],
    productsUnavailable: products.status === "rejected",
    categoriesUnavailable: categories.status === "rejected",
  };
}
