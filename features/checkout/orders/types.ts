import type { ShippingRequest } from "../shipping/types";
import type { OrderReceipt } from "@/features/orders/types/order";
export type CreateOrderPayload = {
  idempotencyKey: string;
  checkout: ShippingRequest;
  shippingSelections: { storeId: string; courierCode: string; service: string }[];
  expectedGrandTotal: number;
};
export type OrderActionResult =
  | { ok: true; data: OrderReceipt }
  | { ok: false; message: string; uncertain: boolean; refreshRequired?: boolean; authRequired?: boolean };
