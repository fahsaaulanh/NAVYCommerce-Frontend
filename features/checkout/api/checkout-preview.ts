import "server-only";

import { BackendApiError } from "@/lib/api/server";
import { cartApi } from "@/features/cart/api/cart-api";
import { addressApi } from "@/features/addresses/api/address-api";
import type { CheckoutPreview } from "../types/checkout";

export async function loadCheckoutPreview(selectedIds: string[]): Promise<CheckoutPreview> {
  const [cart, addresses] = await Promise.allSettled([cartApi.getMine(), addressApi.getMine()]);
  if (cart.status === "rejected") throw cart.reason;
  if (addresses.status === "rejected" && !(addresses.reason instanceof BackendApiError)) throw addresses.reason;
  const requested = new Set(selectedIds);
  const items = cart.value.data.items.filter(item => requested.has(item.id.toLowerCase()));
  return {
    selectedIds, items,
    missingCount: selectedIds.length - items.length,
    addresses: addresses.status === "fulfilled" ? addresses.value.data : [],
    addressError: addresses.status === "rejected"
      ? { status: addresses.reason.status, message: addresses.reason.message } : null,
  };
}
