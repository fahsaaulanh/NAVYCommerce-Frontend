import "server-only";
import { backendGet, backendPost } from "@/lib/api/server";
import type { CreateOrderPayload } from "@/features/checkout/orders/types";
import type { OrderResponse } from "../types/order";
export const orderApi = {
  create(payload: CreateOrderPayload) {
    return backendPost<OrderResponse>("/checkout/orders", payload, { timeoutMs: 60_000 });
  },
  getById(id: string) {
    return backendGet<OrderResponse>(`/checkout/orders/${encodeURIComponent(id)}`);
  },
  cancel(id: string) {
    return backendPost<OrderResponse>(`/checkout/orders/${encodeURIComponent(id)}/cancel`, {});
  },
};
