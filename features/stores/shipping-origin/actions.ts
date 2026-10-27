"use server";

import { revalidatePath } from "next/cache";
import { BackendApiError } from "@/lib/api/server";
import { getSession, deleteSession } from "@/lib/auth/session";
import { isGuid, normalizeFieldErrors } from "@/lib/validation";
import { storeShippingOriginApi } from "./api";
import { parseShippingOrigin } from "./validation";
import type { StoreShippingOriginActionResult } from "./types";

export async function saveStoreShippingOriginAction(
  storeId: unknown,
  data: FormData,
): Promise<StoreShippingOriginActionResult> {
  const user = await getSession();
  if (!user)
    return {
      ok: false,
      message: "Sesi berakhir. Silakan masuk kembali.",
      fieldErrors: {},
      authRequired: true,
    };
  if (user.role !== "Seller")
    return {
      ok: false,
      message: "Pengaturan ini hanya tersedia untuk Seller.",
      fieldErrors: {},
    };
  if (!isGuid(storeId) || !(data instanceof FormData))
    return { ok: false, message: "Data toko tidak valid.", fieldErrors: {} };
  const { payload, fieldErrors } = parseShippingOrigin(data);
  if (Object.keys(fieldErrors).length)
    return {
      ok: false,
      message: "Periksa kembali data yang ditandai.",
      fieldErrors,
    };

  let result: StoreShippingOriginActionResult;
  try {
    const response = await storeShippingOriginApi.save(storeId, payload);
    result = { ok: true, message: response.message };
  } catch (error) {
    if (!(error instanceof BackendApiError)) throw error;
    if (error.status === 401) await deleteSession();
    const regionUnavailable =
      error.code === "STORE_SHIPPING_ORIGIN_REGION_UNAVAILABLE";
    const outcomeUnknown = error.status >= 500 && !regionUnavailable;
    result = {
      ok: false,
      fieldErrors: normalizeFieldErrors(error.fieldErrors),
      authRequired: error.status === 401,
      outcomeUnknown,
      message: regionUnavailable
        ? "Wilayah alamat belum dapat diperiksa. Silakan coba kembali."
        : outcomeUnknown
          ? "Status penyimpanan belum dapat dipastikan. Muat ulang alamat sebelum mencoba kembali."
          : error.message,
    };
  }
  revalidatePath(`/seller/stores/${storeId}/shipping-origin`);
  revalidatePath(`/seller/stores/${storeId}`);
  revalidatePath("/checkout");
  return result;
}
