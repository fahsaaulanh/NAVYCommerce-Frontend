import type { CustomerAddress } from "@/features/addresses/types/address";
import type { CartItem } from "@/features/cart/types/cart";

export type CheckoutPreview = {
  selectedIds: string[];
  items: CartItem[];
  missingCount: number;
  addresses: CustomerAddress[];
  addressError: { status: number; message: string } | null;
};
