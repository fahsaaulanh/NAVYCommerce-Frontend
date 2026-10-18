"use server";

import { BackendApiError } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { isGuid } from "@/lib/validation";
import { checkoutShippingApi } from "./api";
import { isShippingQuote } from "./utils";
import type { ShippingActionResult } from "./types";

export async function calculateShippingAction(addressId: unknown, cartItemIds: unknown): Promise<ShippingActionResult> {
  const user = await getSession();
  if (!user) return { ok: false, message: "Sesi berakhir. Silakan masuk kembali.", authRequired: true };
  if (user.role !== "Customer") return { ok: false, message: "Checkout tersedia untuk akun Customer." };
  if (!isGuid(addressId) || !Array.isArray(cartItemIds) || cartItemIds.length < 1 ||
      cartItemIds.length > 100 || !cartItemIds.every(isGuid) ||
      new Set(cartItemIds.map(id => id.toLowerCase())).size !== cartItemIds.length)
    return { ok: false, message: "Alamat atau pilihan barang tidak valid. Perbarui data checkout.", refreshRequired: true };

  try {
    const raw = await checkoutShippingApi.calculate({ addressId, cartItemIds });
    const data = raw && typeof raw === "object" && "data" in raw ? raw.data : null;
    if (!isShippingQuote(data)) return { ok: false, message: "Respons pengiriman tidak dapat dibaca. Silakan coba kembali." };
    const ids = data.packages.flatMap(p => p.cartItemIds.map(id => id.toLowerCase()));
    const requested = new Set(cartItemIds.map(id => id.toLowerCase()));
    if (data.addressId.toLowerCase() !== addressId.toLowerCase() || ids.length !== requested.size ||
        new Set(ids).size !== ids.length || ids.some(id => !requested.has(id)))
      return { ok: false, message: "Data checkout berubah. Perbarui data sebelum menghitung ulang.", refreshRequired: true };
    return { ok: true, data };
  } catch (error) {
    if (!(error instanceof BackendApiError)) throw error;
    return { ok: false, authRequired: error.status === 401,
      refreshRequired: error.code === "CHECKOUT_CART_INVALID" || error.code === "CHECKOUT_ADDRESS_NOT_FOUND",
      message: error.status === 429 ? "Terlalu banyak permintaan ongkir. Tunggu sekitar satu menit sebelum mencoba kembali."
        : error.status === 401 ? "Sesi berakhir. Silakan masuk kembali."
        : error.status >= 500 ? "Pilihan pengiriman belum dapat dimuat. Silakan coba kembali."
        : error.message };
  }
}
