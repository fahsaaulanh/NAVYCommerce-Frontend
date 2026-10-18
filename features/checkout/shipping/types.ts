export type ShippingRate = {
  courierCode: string; courierName: string; service: string;
  description: string; cost: number; estimatedDelivery: string;
};
export type ShippingPackage = {
  storeId: string; storeName: string; cartItemIds: string[];
  weightGrams: number; itemsSubtotal: number; status: string;
  message: string | null; rates: ShippingRate[];
};
export type ShippingQuote = {
  addressId: string; calculatedAt: string; isComplete: boolean;
  packages: ShippingPackage[];
};
export type ShippingRequest = { addressId: string; cartItemIds: string[] };
export type ShippingActionResult =
  | { ok: true; data: ShippingQuote }
  | { ok: false; message: string; authRequired?: boolean; refreshRequired?: boolean };
