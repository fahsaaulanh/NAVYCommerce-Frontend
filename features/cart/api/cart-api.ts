import "server-only";

import { backendGet, backendPost, backendPut, backendDelete } from "@/lib/api/server";
import type { CartResponse, CartMutationResponse } from "../types/cart";

export const cartApi = {
  getMine() {
    return backendGet<CartResponse>("/Carts/mine");
  },
  addItem(productVariantId: string, quantity: number) {
    return backendPost<CartMutationResponse>("/Carts/items", { productVariantId, quantity });
  },
  updateQuantity(itemId: string, quantity: number) {
    return backendPut<CartMutationResponse>(`/Carts/items/${encodeURIComponent(itemId)}`, { quantity });
  },
  removeItem(itemId: string) {
    return backendDelete<CartMutationResponse>(`/Carts/items/${encodeURIComponent(itemId)}`);
  },
};
