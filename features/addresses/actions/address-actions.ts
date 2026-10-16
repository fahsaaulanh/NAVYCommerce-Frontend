"use server";

import { revalidatePath } from "next/cache";
import { BackendApiError } from "@/lib/api/server";
import { deleteSession, getSession } from "@/lib/auth/session";
import { addressApi } from "../api/address-api";
import { isAddressId, normalizeAddressErrors, parseAddress } from "../utils/validation";
import type { AddressActionResult, AddressMutationResponse } from "../types/address";

const failure = (message: string): Extract<AddressActionResult, { ok: false }> => ({ ok: false, message, fieldErrors: {} });

async function mutate(operation: () => Promise<AddressMutationResponse>): Promise<AddressActionResult> {
  const user = await getSession();
  if (!user) return { ...failure("Sesi berakhir. Silakan masuk kembali."), authRequired: true };
  if (user.role !== "Customer") return failure("Pengelolaan alamat tersedia untuk akun Customer.");

  let result: AddressActionResult;
  try {
    const response = await operation();
    result = { ok: true, message: response.message };
  } catch (error) {
    if (!(error instanceof BackendApiError)) throw error;
    if (error.status === 401) await deleteSession();
    const outcomeUnknown = error.status >= 500 && error.code !== "ADDRESS_REGION_UNAVAILABLE";
    result = {
      ok: false,
      message: error.code === "ADDRESS_REGION_UNAVAILABLE"
        ? "Wilayah alamat belum dapat diperiksa. Silakan coba kembali."
        : outcomeUnknown
          ? "Status perubahan belum dapat dipastikan. Periksa daftar alamat sebelum mengulangi tindakan."
          : error.message,
      fieldErrors: normalizeAddressErrors(error.fieldErrors),
      authRequired: error.status === 401,
      outcomeUnknown,
    };
  }
  // Membaca ulang daftar juga penting saat perubahan mungkin sudah tersimpan
  // tetapi responsnya terputus.
  revalidatePath("/account/addresses");
  return result;
}

export async function saveAddressAction(id: unknown, formData: FormData): Promise<AddressActionResult> {
  if (id !== null && !isAddressId(id)) return failure("Identitas alamat tidak valid.");
  if (!(formData instanceof FormData)) return failure("Data alamat tidak valid.");
  const { payload, fieldErrors } = parseAddress(formData);
  if (Object.keys(fieldErrors).length)
    return { ok: false, message: "Periksa kembali data alamat yang ditandai.", fieldErrors };
  return mutate(() => typeof id === "string" ? addressApi.update(id, payload) : addressApi.create(payload));
}

export async function setDefaultAddressAction(id: unknown): Promise<AddressActionResult> {
  if (!isAddressId(id)) return failure("Identitas alamat tidak valid.");
  return mutate(() => addressApi.setDefault(id));
}

export async function deleteAddressAction(id: unknown): Promise<AddressActionResult> {
  if (!isAddressId(id)) return failure("Identitas alamat tidak valid.");
  return mutate(() => addressApi.remove(id));
}
