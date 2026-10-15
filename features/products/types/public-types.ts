import type { ProductDetail, ProductImage } from "./types";

export type PublicProductThumbnail = {
  url: string;
  urlExpiresAt: string;
  altText: string;
};

export type PublicProductSummary = {
  id: string;
  storeId: string;
  categoryId: number;
  title: string;
  slug: string;
  basePrice: number;
  storeName: string;
  storeSlug: string;
  categoryName: string | null;
  minPrice: number;
  maxPrice: number;
  hasStock: boolean;
  thumbnail: PublicProductThumbnail | null;
};

export type PublicProductListResponse = {
  data: PublicProductSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PublicProductDetailData = {
  product: ProductDetail;
  store: {
    id: string;
    name: string;
    slug: string;
  };
  categoryName: string | null;
  images: ProductImage[];
};

export type PublicProductDetailResponse = {
  data: PublicProductDetailData;
};

export type CatalogCategory = import("@/features/categories/types").Category & {
  productCount: number;
};
