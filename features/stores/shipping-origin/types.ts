import type { RegionSelection } from "@/features/regions/types/region";

export type StoreShippingOrigin = RegionSelection & {
  storeId: string;
  contactName: string;
  phoneNumber: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  addressLine: string;
  pickupNotes: string | null;
  createdAt: string;
  updatedAt: string;
};
export type SaveStoreShippingOriginPayload = Pick<
  StoreShippingOrigin,
  | "contactName"
  | "phoneNumber"
  | "villageCode"
  | "postalCode"
  | "addressLine"
  | "pickupNotes"
>;
export type StoreShippingOriginResponse = { data: StoreShippingOrigin | null };
export type StoreShippingOriginMutationResponse = {
  code: string;
  message: string;
  data: StoreShippingOrigin;
};
export type StoreShippingOriginActionResult =
  | { ok: true; message: string }
  | {
      ok: false;
      message: string;
      fieldErrors: Record<string, string[]>;
      authRequired?: boolean;
      outcomeUnknown?: boolean;
    };
