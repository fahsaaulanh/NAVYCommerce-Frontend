import type { ProductImage } from "@/features/products/types/types";

export type CartItem = {
  id: string;
  productId: string;
  productVariantId: string;
  storeId: string;
  storeName: string;
  productTitle: string;
  productSlug: string;
  sku: string;
  options: { name: string; value: string }[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  availableStock: number;
  canCheckout: boolean;
  image: ProductImage | null;
};

export type Cart = {
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
};

export type CartResponse = { data: Cart };
export type CartMutationResponse = {
  code: string;
  message: string;
  data: { itemId: string };
};

export type CartActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; authRequired?: boolean };
