"use server";

import { revalidatePath } from "next/cache";
import { BackendApiError } from "@/lib/api/server";
import { deleteSession, getSession } from "@/lib/auth/session";
import { cartApi } from "../api/cart-api";
import { isCartId, isCartQuantity } from "../utils/validation";
import type { CartActionResult, CartMutationResponse } from "../types/cart";

async function mutate(
  operation: () => Promise<CartMutationResponse>,
): Promise<CartActionResult> {
  const user = await getSession();
  if (!user) {
    return {
      ok: false,
      authRequired: true,
      message: "Masuk sebagai Customer untuk menggunakan keranjang.",
    };
  }
  if (user.role !== "Customer") {
    return {
      ok: false,
      message: "Keranjang belanja tersedia untuk akun Customer.",
    };
  }

  let result: CartActionResult;
  try {
    const response = await operation();
    result = { ok: true, message: response.message };
  } catch (error) {
    if (!(error instanceof BackendApiError)) throw error;
    if (error.status === 401) await deleteSession();
    result = {
      ok: false,
      message: error.message,
      authRequired: error.status === 401,
    };
  }

  revalidatePath("/cart", "layout");
  revalidatePath("/products", "layout");
  revalidatePath("/(storefront)", "layout");
  return result;
}

export async function addCartItemAction(
  productVariantId: unknown,
  quantity: unknown,
): Promise<CartActionResult> {
  if (!isCartId(productVariantId) || !isCartQuantity(quantity)) {
    return { ok: false, message: "Pilih varian dan jumlah produk yang valid." };
  }
  return mutate(() => cartApi.addItem(productVariantId, quantity));
}

export async function updateCartItemAction(
  itemId: unknown,
  quantity: unknown,
): Promise<CartActionResult> {
  if (!isCartId(itemId) || !isCartQuantity(quantity)) {
    return {
      ok: false,
      message: "Jumlah produk harus berupa bilangan bulat lebih dari 0.",
    };
  }
  return mutate(() => cartApi.updateQuantity(itemId, quantity));
}

export async function removeCartItemAction(
  itemId: unknown,
): Promise<CartActionResult> {
  if (!isCartId(itemId))
    return { ok: false, message: "Item keranjang tidak valid." };
  return mutate(() => cartApi.removeItem(itemId));
}
