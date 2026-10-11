"use server";

import { getSession } from "@/lib/auth/session";
import { BackendApiError } from "@/lib/api/server";
import { productApi } from "./product-api";

type UpdateVariantResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateProductVariantAction(
  productId: string,
  variantId: string,
  formData: FormData,
): Promise<UpdateVariantResult> {
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
      message: "Kamu tidak memiliki izin untuk mengubah varian.",
    };
  }

  if (!guidPattern.test(productId) || !guidPattern.test(variantId)) {
    return {
      ok: false,
      message: "ID produk atau varian tidak valid.",
    };
  }

  const rawStock = formData.get("stockQuantity");
  const rawAdjustment = formData.get("priceAdjustment");

  if (typeof rawStock !== "string" || !/^\d+$/.test(rawStock.trim())) {
    return {
      ok: false,
      message: "Stok harus berupa bilangan bulat 0 atau lebih.",
    };
  }

  const stockQuantity = Number(rawStock.trim());

  if (!Number.isSafeInteger(stockQuantity) || stockQuantity > 2_147_483_647) {
    return {
      ok: false,
      message: "Jumlah stok melebihi batas yang diizinkan.",
    };
  }

  if (
    typeof rawAdjustment !== "string" ||
    !/^-?\d+(?:\.\d{1,2})?$/.test(rawAdjustment.trim())
  ) {
    return {
      ok: false,
      message:
        "Penyesuaian harga harus berupa angka dengan maksimal 2 angka desimal.",
    };
  }

  const priceAdjustment = Number(rawAdjustment.trim());

  if (
    !Number.isFinite(priceAdjustment) ||
    Math.abs(priceAdjustment) > 999_999_999_999.99
  ) {
    return {
      ok: false,
      message: "Penyesuaian harga melebihi batas yang diizinkan.",
    };
  }

  try {
    await productApi.updateVariant(productId, variantId, {
      stockQuantity,
      priceAdjustment,
    });

    return {
      ok: true,
      message: "Stok dan harga varian berhasil diperbarui.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendApiError
          ? error.message
          : "Hasil perubahan belum dapat dikonfirmasi. Muat ulang produk sebelum mencoba kembali.",
    };
  }
}
