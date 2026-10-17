import { regionPatterns } from "@/features/regions/types/region";
import type { SaveAddressPayload } from "../types/address";

export {
  isGuid as isAddressId,
  normalizeFieldErrors as normalizeAddressErrors,
} from "@/lib/validation";

export function parseAddress(formData: FormData): {
  payload: SaveAddressPayload;
  fieldErrors: Record<string, string[]>;
} {
  const read = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const payload: SaveAddressPayload = {
    label: read("label"),
    recipientName: read("recipientName"),
    phoneNumber: read("phoneNumber"),
    villageCode: read("villageCode"),
    postalCode: read("postalCode"),
    addressLine: read("addressLine"),
    deliveryNotes: read("deliveryNotes") || null,
  };
  const fieldErrors: Record<string, string[]> = {};
  const required: [keyof SaveAddressPayload, string, number][] = [
    ["label", "Label alamat", 50],
    ["recipientName", "Nama penerima", 150],
    ["addressLine", "Alamat lengkap", 500],
  ];
  for (const [key, label, limit] of required) {
    const value = payload[key];
    if (!value) fieldErrors[key] = [`${label} wajib diisi.`];
    else if (value.length > limit)
      fieldErrors[key] = [`${label} maksimal ${limit} karakter.`];
  }
  if (!/^\+?[0-9]{8,15}$/.test(payload.phoneNumber))
    fieldErrors.phoneNumber = [
      "Gunakan 8–15 digit, boleh diawali +, tanpa spasi.",
    ];
  if (!regionPatterns.village.test(payload.villageCode))
    fieldErrors.villageCode = ["Pilih kelurahan atau desa yang valid."];
  if (!/^[0-9]{5}$/.test(payload.postalCode))
    fieldErrors.postalCode = ["Kode pos harus terdiri dari 5 digit."];
  if ((payload.deliveryNotes?.length ?? 0) > 250)
    fieldErrors.deliveryNotes = ["Catatan pengiriman maksimal 250 karakter."];
  return { payload, fieldErrors };
}
