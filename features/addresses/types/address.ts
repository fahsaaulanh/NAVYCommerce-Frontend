export type CustomerAddress = {
  id: string;
  label: string;
  recipientName: string;
  phoneNumber: string;
  provinceCode: string;
  province: string;
  cityCode: string;
  city: string;
  districtCode: string;
  district: string;
  villageCode: string;
  village: string | null;
  postalCode: string;
  addressLine: string;
  deliveryNotes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveAddressPayload = Pick<CustomerAddress,
  "label" | "recipientName" | "phoneNumber" | "villageCode" |
  "postalCode" | "addressLine" | "deliveryNotes">;

export type AddressListResponse = { data: CustomerAddress[] };
export type AddressMutationResponse = {
  code: string;
  message: string;
  data: CustomerAddress | null;
};
export type AddressActionResult =
  | { ok: true; message: string }
  | {
      ok: false;
      message: string;
      fieldErrors: Record<string, string[]>;
      authRequired?: boolean;
      outcomeUnknown?: boolean;
    };
