import { regionPatterns } from "@/features/regions/types/region";
import type { SaveStoreShippingOriginPayload } from "./types";

export function parseShippingOrigin(data: FormData) {
  const read = (key: string) => {
    const value = data.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const payload: SaveStoreShippingOriginPayload = {
    contactName: read("contactName"),
    phoneNumber: read("phoneNumber"),
    villageCode: read("villageCode"),
    postalCode: read("postalCode"),
    addressLine: read("addressLine"),
    pickupNotes: read("pickupNotes") || null,
  };
  const fieldErrors: Record<string, string[]> = {};
  for (const [key, label, max] of [
    ["contactName", "Nama kontak", 150],
    ["addressLine", "Alamat lengkap", 500],
  ] as const) {
    if (!payload[key]) fieldErrors[key] = [`${label} wajib diisi.`];
    else if (payload[key].length > max)
      fieldErrors[key] = [`${label} maksimal ${max} karakter.`];
  }
  if (!/^\+?[0-9]{8,15}$/.test(payload.phoneNumber))
    fieldErrors.phoneNumber = [
      "Gunakan 8–15 digit, boleh diawali +, tanpa spasi.",
    ];
  if (!regionPatterns.village.test(payload.villageCode))
    fieldErrors.villageCode = ["Pilih kelurahan atau desa yang valid."];
  if (!/^[0-9]{5}$/.test(payload.postalCode))
    fieldErrors.postalCode = ["Kode pos harus terdiri dari 5 digit."];
  if ((payload.pickupNotes?.length ?? 0) > 250)
    fieldErrors.pickupNotes = ["Catatan maksimal 250 karakter."];
  return { payload, fieldErrors };
}
