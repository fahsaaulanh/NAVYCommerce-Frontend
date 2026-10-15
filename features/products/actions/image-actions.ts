"use server";

import { getSession } from "@/lib/auth/session";
import { BackendApiError } from "@/lib/api/server";
import { productApi } from "../api/product-api";
import {
  MAX_IMAGE_ALT_TEXT,
  MAX_PRODUCT_IMAGES,
  validateImageFile,
} from "../utils/image-rules";
import type { UploadProductImageResult } from "../types/types";
import type { ProductImageMutationResult } from "../types/types";

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function uploadProductImageAction(
  productId: string,
  formData: FormData,
): Promise<UploadProductImageResult> {
  const user = await getSession();

  if (!user) {
    return {
      ok: false,
      message: "Session berakhir. Silakan login kembali.",
    };
  }

  if (user.role !== "Seller") {
    return {
      ok: false,
      message: "Kamu tidak memiliki izin untuk mengunggah gambar produk.",
    };
  }

  if (!guidPattern.test(productId)) {
    return {
      ok: false,
      message: "ID produk tidak valid.",
    };
  }

  const files = formData.getAll("file");

  if (files.length !== 1 || !(files[0] instanceof File)) {
    return {
      ok: false,
      message: "Pilih satu file gambar.",
    };
  }

  const file = files[0];
  const fileError = validateImageFile(file);

  if (fileError) {
    return {
      ok: false,
      message: fileError,
    };
  }

  const rawAltText = formData.get("altText");

  if (rawAltText !== null && typeof rawAltText !== "string") {
    return {
      ok: false,
      message: "Deskripsi gambar tidak valid.",
    };
  }

  const altText = (rawAltText ?? "").trim();

  if (altText.length > MAX_IMAGE_ALT_TEXT) {
    return {
      ok: false,
      message: "Deskripsi gambar maksimal 250 karakter.",
    };
  }

  const payload = new FormData();

  payload.append("File", file, file.name);
  payload.append("AltText", altText);

  try {
    const response = await productApi.uploadImage(productId, payload);

    return {
      ok: true,
      image: response.data,
    };
  } catch (error) {
    if (error instanceof BackendApiError) {
      return {
        ok: false,
        message: error.message,
      };
    }

    console.error("Upload gambar produk gagal.");

    return {
      ok: false,
      message:
        "Hasil upload belum dapat dikonfirmasi. Muat ulang galeri sebelum mencoba kembali.",
    };
  }
}

async function validateImageMutation(
  productId: string,
  imageId: string,
): Promise<string | null> {
  const user = await getSession();

  if (!user) {
    return "Session berakhir. Silakan login kembali.";
  }

  if (user.role !== "Seller") {
    return "Kamu tidak memiliki izin untuk mengubah gambar produk.";
  }

  if (!guidPattern.test(productId) || !guidPattern.test(imageId)) {
    return "ID produk atau gambar tidak valid.";
  }

  return null;
}

export async function updateProductImageAltTextAction(
  productId: string,
  imageId: string,
  altText: string,
): Promise<ProductImageMutationResult> {
  const validationError = await validateImageMutation(productId, imageId);

  if (validationError) {
    return { ok: false, message: validationError };
  }

  const normalizedAltText = altText.trim();

  if (!normalizedAltText || normalizedAltText.length > MAX_IMAGE_ALT_TEXT) {
    return {
      ok: false,
      message: "Deskripsi gambar wajib diisi dan maksimal 250 karakter.",
    };
  }

  try {
    await productApi.updateImageAltText(productId, imageId, normalizedAltText);

    return {
      ok: true,
      message: "Deskripsi gambar berhasil diperbarui.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendApiError
          ? error.message
          : "Hasil perubahan belum dapat dikonfirmasi. Muat ulang galeri sebelum mencoba kembali.",
    };
  }
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string,
): Promise<ProductImageMutationResult> {
  const validationError = await validateImageMutation(productId, imageId);

  if (validationError) {
    return { ok: false, message: validationError };
  }

  try {
    await productApi.deleteImage(productId, imageId);

    return {
      ok: true,
      message: "Gambar berhasil dihapus dari galeri.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendApiError
          ? error.message
          : "Hasil penghapusan belum dapat dikonfirmasi. Muat ulang galeri sebelum mencoba kembali.",
    };
  }
}

export async function reorderProductImagesAction(
  productId: string,
  imageIds: string[],
): Promise<ProductImageMutationResult> {
  const user = await getSession();

  if (!user) {
    return {
      ok: false,
      message: "Session berakhir. Silakan login kembali.",
    };
  }

  if (user.role !== "Seller") {
    return {
      ok: false,
      message: "Kamu tidak memiliki izin untuk mengatur gambar produk.",
    };
  }

  if (!guidPattern.test(productId)) {
    return {
      ok: false,
      message: "ID produk tidak valid.",
    };
  }

  const emptyGuid = "00000000-0000-0000-0000-000000000000";

  if (
    !Array.isArray(imageIds) ||
    imageIds.length === 0 ||
    imageIds.length > MAX_PRODUCT_IMAGES ||
    imageIds.some(
      (id) =>
        typeof id !== "string" ||
        !guidPattern.test(id) ||
        id.toLowerCase() === emptyGuid,
    )
  ) {
    return {
      ok: false,
      message: "Daftar gambar tidak valid.",
    };
  }

  const normalizedIds = imageIds.map((id) => id.toLowerCase());

  if (new Set(normalizedIds).size !== normalizedIds.length) {
    return {
      ok: false,
      message: "Daftar gambar tidak boleh berisi ID berulang.",
    };
  }

  try {
    await productApi.reorderImages(productId, normalizedIds);

    return {
      ok: true,
      message: "Urutan galeri berhasil diperbarui.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendApiError
          ? error.message
          : "Hasil perubahan belum dapat dikonfirmasi. Muat ulang galeri sebelum mencoba kembali.",
    };
  }
}

export async function setProductOptionImageAction(
  productId: string,
  optionValueId: string,
  imageId: string | null,
): Promise<ProductImageMutationResult> {
  const user = await getSession();

  if (!user) {
    return {
      ok: false,
      message: "Session berakhir. Silakan login kembali.",
    };
  }

  if (user.role !== "Seller") {
    return {
      ok: false,
      message: "Kamu tidak memiliki izin untuk mengubah gambar opsi.",
    };
  }

  if (!guidPattern.test(productId) || !guidPattern.test(optionValueId)) {
    return {
      ok: false,
      message: "ID produk atau nilai opsi tidak valid.",
    };
  }

  if (
    imageId !== null &&
    (typeof imageId !== "string" ||
      !guidPattern.test(imageId) ||
      imageId === "00000000-0000-0000-0000-000000000000")
  ) {
    return {
      ok: false,
      message: "ID gambar tidak valid.",
    };
  }

  try {
    await productApi.setOptionImage(productId, optionValueId, imageId);

    return {
      ok: true,
      message: imageId
        ? "Gambar nilai opsi berhasil diperbarui."
        : "Hubungan gambar nilai opsi berhasil dilepas.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendApiError
          ? error.message
          : "Hasil perubahan belum dapat dikonfirmasi. Muat ulang halaman.",
    };
  }
}
