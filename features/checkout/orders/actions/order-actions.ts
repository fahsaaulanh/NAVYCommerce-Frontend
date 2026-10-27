"use server";
import { revalidatePath } from "next/cache";
import { BackendApiError } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { isGuid } from "@/lib/validation";
import { orderApi } from "@/features/orders/api/order-api";
import { isCreateOrderPayload, isOrderReceipt } from "../utils/validation";
import type { OrderActionResult } from "../types";

function invalidateShopping() {
  revalidatePath("/cart", "layout");
  revalidatePath("/products", "layout");
  revalidatePath("/(storefront)", "layout");
  revalidatePath("/orders", "layout");
}
async function authorize(): Promise<OrderActionResult | null> {
  const user = await getSession();
  if (!user) return { ok: false, uncertain: false, authRequired: true, message: "Sesi berakhir. Masuk kembali untuk melanjutkan." };
  if (user.role !== "Customer") return { ok: false, uncertain: false, message: "Pesanan tersedia untuk akun Customer." };
  return null;
}
function failure(error: unknown): OrderActionResult {
  if (!(error instanceof BackendApiError))
    return { ok: false, uncertain: true, message: "Hasil permintaan belum dapat dipastikan. Coba lagi untuk memeriksa pesanan yang sama." };
  return {
    ok: false,
    uncertain: error.status >= 500 || error.code === "CHECKOUT_IDEMPOTENCY_CONFLICT",
    authRequired: error.status === 401,
    refreshRequired: ["CHECKOUT_CART_INVALID", "CHECKOUT_ADDRESS_NOT_FOUND", "CHECKOUT_TOTAL_CHANGED", "CHECKOUT_INPUT_CHANGED", "CHECKOUT_SHIPPING_UNAVAILABLE", "CHECKOUT_SHIPPING_SELECTION_INVALID"].includes(error.code ?? ""),
    message: error.status >= 500 ? "Hasil permintaan belum dapat dipastikan. Coba lagi untuk memeriksa pesanan yang sama."
      : error.status === 429 ? "Tunggu sebentar sebelum mencoba kembali." : error.message,
  };
}
export async function createOrderAction(payload: unknown): Promise<OrderActionResult> {
  const denied = await authorize();
  if (denied) return denied;
  if (!isCreateOrderPayload(payload)) return { ok: false, uncertain: false, message: "Periksa alamat, barang, dan pilihan pengiriman." };
  try {
    const response = await orderApi.create(payload);
    if (!isOrderReceipt(response?.data)) return { ok: false, uncertain: true, message: "Pesanan mungkin sudah dibuat. Coba lagi untuk memeriksa hasilnya." };
    invalidateShopping();
    return { ok: true, data: response.data };
  } catch (error) { return failure(error); }
}
export async function cancelOrderAction(id: unknown): Promise<OrderActionResult> {
  const denied = await authorize();
  if (denied) return denied;
  if (!isGuid(id)) return { ok: false, uncertain: false, message: "Nomor pesanan tidak valid." };
  try {
    const response = await orderApi.cancel(id);
    if (!isOrderReceipt(response?.data)) return { ok: false, uncertain: true, message: "Perbarui halaman untuk memeriksa status pesanan." };
    invalidateShopping();
    return { ok: true, data: response.data };
  } catch (error) { return failure(error); }
}
