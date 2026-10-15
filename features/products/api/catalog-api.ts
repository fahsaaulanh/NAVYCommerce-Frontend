import "server-only";
import { cache } from "react";
import { backendPublicGet } from "@/lib/api/public-server";
import type {
  CatalogCategory,
  PublicProductListResponse,
  PublicProductDetailResponse,
} from "../types/public-types";
import {
  CATALOG_PAGE_SIZE,
  catalogParams,
  type CatalogQuery,
} from "../utils/catalog-query";
export const catalogApi = {
  getProducts(query: CatalogQuery) {
    const params = catalogParams(query);
    params.set("page", String(query.page));
    params.set("pageSize", String(CATALOG_PAGE_SIZE));
    return backendPublicGet<PublicProductListResponse>(
      `/Products?${params.toString()}`,
    );
  },
  getCategories() {
    return backendPublicGet<CatalogCategory[]>("/Products/categories");
  },
  getProduct(productId: string) {
    return backendPublicGet<PublicProductDetailResponse>(
      `/Products/${encodeURIComponent(productId)}`,
    );
  },
};

export const getCatalogCategories = cache(() => catalogApi.getCategories());
