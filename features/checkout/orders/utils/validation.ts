import { isGuid } from "@/lib/validation";
import type { CreateOrderPayload } from "../types";
import type { OrderReceipt } from "@/features/orders/types/order";
export function isCreateOrderPayload(value: unknown): value is CreateOrderPayload {
  if (!value || typeof value !== "object") return false;
  const p = value as CreateOrderPayload;
  return isGuid(p.idempotencyKey) && !!p.checkout && isGuid(p.checkout.addressId)
    && Array.isArray(p.checkout.cartItemIds) && p.checkout.cartItemIds.length > 0
    && p.checkout.cartItemIds.length <= 100 && p.checkout.cartItemIds.every(isGuid)
    && new Set(p.checkout.cartItemIds.map(id => id.toLowerCase())).size === p.checkout.cartItemIds.length
    && Array.isArray(p.shippingSelections) && p.shippingSelections.length > 0 && p.shippingSelections.length <= 5
    && p.shippingSelections.every(s => !!s && isGuid(s.storeId)
      && typeof s.courierCode === "string" && s.courierCode.trim().length > 0 && s.courierCode.length <= 50
      && typeof s.service === "string" && s.service.trim().length > 0 && s.service.length <= 100)
    && new Set(p.shippingSelections.map(s => s.storeId.toLowerCase())).size === p.shippingSelections.length
    && Number.isFinite(p.expectedGrandTotal) && p.expectedGrandTotal > 0
    && p.expectedGrandTotal <= Number.MAX_SAFE_INTEGER / 100;
}
export function isOrderReceipt(value: unknown): value is OrderReceipt {
  if (!value || typeof value !== "object") return false;
  const p = value as OrderReceipt;
  const money = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n >= 0;
  return isGuid(p.id) && ["Pending", "Paid", "Cancelled", "Expired"].includes(p.paymentStatus)
    && p.currency === "IDR" && Number.isFinite(Date.parse(p.createdAt)) && Number.isFinite(Date.parse(p.expiresAt))
    && money(p.itemsSubtotal) && money(p.shippingTotal) && money(p.grandTotal)
    && Array.isArray(p.storeOrders) && p.storeOrders.length > 0
    && p.storeOrders.every(s => !!s && isGuid(s.id) && isGuid(s.storeId) && typeof s.storeName === "string"
      && typeof s.status === "string" && money(s.itemsSubtotal) && money(s.shippingCost) && money(s.grandTotal));
}
