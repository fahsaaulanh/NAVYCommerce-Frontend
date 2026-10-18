import "server-only";
import { backendPost } from "@/lib/api/server";
import type { ShippingRequest } from "./types";

export const checkoutShippingApi = {
  calculate(payload: ShippingRequest) {
    // Backend dapat memanggil provider berurutan untuk beberapa toko.
    return backendPost<unknown>("/checkout/shipping/quotes", payload, { timeoutMs: 60_000 });
  },
};
