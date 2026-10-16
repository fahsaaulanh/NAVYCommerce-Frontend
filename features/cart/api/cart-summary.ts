import "server-only";

import { BackendApiError } from "@/lib/api/server";
import type { SessionUser } from "@/lib/auth/session";
import { cartApi } from "./cart-api";

export async function getCartQuantity(
  user: SessionUser | null,
): Promise<number | null> {
  if (user?.role !== "Customer") return null;

  try {
    const { data } = await cartApi.getSummary();
    return data.totalQuantity;
  } catch (error) {
    if (error instanceof BackendApiError) return null;
    throw error;
  }
}
