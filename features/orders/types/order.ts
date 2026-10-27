export type OrderStatus = "Pending" | "Paid" | "Cancelled" | "Expired";
export type StoreOrderReceipt = {
  id: string; storeId: string; storeName: string; status: string;
  itemsSubtotal: number; shippingCost: number; grandTotal: number;
};
export type OrderReceipt = {
  id: string; paymentStatus: OrderStatus; currency: string;
  itemsSubtotal: number; shippingTotal: number; grandTotal: number;
  createdAt: string; expiresAt: string; storeOrders: StoreOrderReceipt[];
};
export type OrderResponse = { data: OrderReceipt };
