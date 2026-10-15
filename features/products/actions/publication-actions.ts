"use server";

import { getSession } from "@/lib/auth/session";
import { BackendApiError } from "@/lib/api/server";

import { productApi } from "../api/product-api";
import type { ProductPublicationActionResult } from "../types/types";

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function setProductPublicationAction(
  productId: string,
  isActive: boolean,
): Promise<ProductPublicationActionResult> {
  const user = await getSession();

  if (!user || user.role !== "Seller") {
    return {
      ok: false,
      message: "Sesi tidak tersedia atau akun tidak memiliki izin.",
      issues: [],
    };
  }

  if (
    !guidPattern.test(productId) ||
    productId === "00000000-0000-0000-0000-000000000000" ||
    typeof isActive !== "boolean"
  ) {
    return {
      ok: false,
      message: "Permintaan perubahan status tidak valid.",
      issues: [],
    };
  }

  try {
    const response = await productApi.setPublication(productId, isActive);

    return {
      ok: true,
      message: response.message,
      isActive: response.data.isActive,
    };
  } catch (error) {
    if (error instanceof BackendApiError) {
      return {
        ok: false,
        message: error.message,
        issues: error.issues,
      };
    }

    return {
      ok: false,
      message:
        "Status terbaru belum dapat dipastikan. Muat ulang halaman sebelum mencoba kembali.",
      issues: [],
    };
  }
}
