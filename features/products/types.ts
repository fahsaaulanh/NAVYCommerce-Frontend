export type ProductOptionValue = {
  id: string;
  value: string;
  sortOrder: number;
  imageId: string | null;
};

export type ProductOption = {
  id: string;
  name: string;
  sortOrder: number;
  values: ProductOptionValue[];
};

export type ProductVariant = {
  id: string;
  sku: string;
  optionValueIds: string[];
  priceAdjustment: number;
  price: number;
  stockQuantity: number;
};

export type ProductDetail = {
  id: string;
  storeId: string;
  categoryId: number;
  title: string;
  slug: string;
  description: string | null;
  weightGrams: number;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  options: ProductOption[];
  variants: ProductVariant[];
};

export type ProductImage = {
  id: string;
  url: string;
  urlExpiresAt: string;
  altText: string;
  sortOrder: number;
  createdAt: string;
};

export type ProductDetailResponse = {
  data: ProductDetail;
};

export type ProductGalleryResponse = {
  data: ProductImage[];
};

export type UploadProductImageResponse = {
  code: string;
  message: string;
  data: ProductImage;
};

export type UploadProductImageResult =
  | {
      ok: true;
      image: ProductImage;
    }
  | {
      ok: false;
      message: string;
    };

export type ProductImageMutationResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export type SellerProductSummary = {
  id: string;
  storeId: string;
  categoryId: number;
  categoryName: string | null;
  title: string;
  slug: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  variantCount: number;
  totalStock: number;
  imageCount: number;
  thumbnail: {
    url: string;
    urlExpiresAt: string;
    altText: string;
  } | null;
};

export type SellerProductListResponse = {
  data: SellerProductSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CreateProductOptionPayload = {
  name: string;
  values: string[];
};

export type CreateProductPayload = {
  storeId: string;
  categoryId: number;
  title: string;
  slug: string;
  description: string | null;
  weightGrams: number;
  basePrice: number;
  options: CreateProductOptionPayload[];
};

export type CreateProductResponse = {
  code: string;
  message: string;
  data: ProductDetail;
};

export type CreateProductActionResult =
  | {
      ok: true;
      productId: string;
    }
  | {
      ok: false;
      message: string;
      fieldErrors: Record<string, string[]>;
    };
