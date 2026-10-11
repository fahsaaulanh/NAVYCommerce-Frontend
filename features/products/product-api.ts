import "server-only";

import {
  backendGet,
  backendPost,
  backendUpload,
  backendPut,
  backendDelete,
} from "@/lib/api/server";
import type {
  ProductDetailResponse,
  ProductGalleryResponse,
  UploadProductImageResponse,
  SellerProductListResponse,
  CreateProductPayload,
  CreateProductResponse,
} from "./types";

export const productApi = {
  getOwnedById(productId: string) {
    const id = encodeURIComponent(productId);

    return backendGet<ProductDetailResponse>(`/Products/mine/${id}`);
  },

  create(payload: CreateProductPayload) {
    return backendPost<CreateProductResponse>("/Products", payload);
  },

  getGallery(productId: string) {
    const id = encodeURIComponent(productId);

    return backendGet<ProductGalleryResponse>(`/Products/${id}/images`);
  },

  uploadImage(productId: string, formData: FormData) {
    const id = encodeURIComponent(productId);

    return backendUpload<UploadProductImageResponse>(
      `/Products/${id}/images`,
      formData,
    );
  },

  updateImageAltText(productId: string, imageId: string, altText: string) {
    const product = encodeURIComponent(productId);
    const image = encodeURIComponent(imageId);

    return backendPut<{ code: string; message: string }>(
      `/Products/${product}/images/${image}/alt-text`,
      { altText },
    );
  },

  deleteImage(productId: string, imageId: string) {
    const product = encodeURIComponent(productId);
    const image = encodeURIComponent(imageId);

    return backendDelete<{ code: string; message: string }>(
      `/Products/${product}/images/${image}`,
    );
  },

  reorderImages(productId: string, imageIds: string[]) {
    const id = encodeURIComponent(productId);

    return backendPut<{ code: string; message: string }>(
      `/Products/${id}/images/order`,
      { imageIds },
    );
  },

  setOptionImage(
    productId: string,
    optionValueId: string,
    imageId: string | null,
  ) {
    const product = encodeURIComponent(productId);
    const value = encodeURIComponent(optionValueId);

    return backendPut<{ code: string; message: string }>(
      `/Products/${product}/images/option-values/${value}`,
      { imageId },
    );
  },

  updateVariant(
    productId: string,
    variantId: string,
    payload: {
      stockQuantity: number;
      priceAdjustment: number;
    },
  ) {
    const product = encodeURIComponent(productId);
    const variant = encodeURIComponent(variantId);

    return backendPut<{ message?: string }>(
      `/Products/${product}/variants/${variant}`,
      payload,
    );
  },

  getOwnedByStore(storeId: string, page = 1, pageSize = 12) {
    const id = encodeURIComponent(storeId);

    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    return backendGet<SellerProductListResponse>(
      `/Products/mine/store/${id}?${query.toString()}`,
    );
  },
};
