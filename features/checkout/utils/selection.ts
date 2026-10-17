import { isCartId } from "@/features/cart/utils/validation";

export const MAX_CHECKOUT_ITEMS = 100;

export function parseCheckoutSelection(raw: unknown): string[] | null {
  if (typeof raw !== "string" || !raw || raw.length > 4000) return null;
  const ids = raw.split(",").map(id => id.toLowerCase());
  if (ids.length > MAX_CHECKOUT_ITEMS || !ids.every(isCartId) || new Set(ids).size !== ids.length) return null;
  return ids;
}

export function checkoutHref(ids: readonly string[], addressId?: string | null): string {
  const query = new URLSearchParams({ items: ids.join(",") });
  if (addressId && isCartId(addressId)) query.set("address", addressId);
  return `/checkout?${query}`;
}
