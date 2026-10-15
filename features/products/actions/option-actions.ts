"use server";

import { getSession } from "@/lib/auth/session";
import { BackendApiError } from "@/lib/api/server";
import { productApi } from "../api/product-api";

type RenameResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validId(value: string) {
  return (
    typeof value === "string" &&
    guidPattern.test(value) &&
    value !== "00000000-0000-0000-0000-000000000000"
  );
}

export async function renameProductLabelAction(
  productId: string,
  targetId: string,
  kind: "option" | "value",
  label: string,
): Promise<RenameResult> {
  const user = await getSession();

  if (!user || user.role !== "Seller") {
    return {
      ok: false,
      message: "Sesi tidak tersedia atau akun tidak memiliki izin.",
    };
  }

  if (
    !validId(productId) ||
    !validId(targetId) ||
    (kind !== "option" && kind !== "value")
  ) {
    return {
      ok: false,
      message: "Permintaan perubahan tidak valid.",
    };
  }

  const trimmed = typeof label === "string" ? label.trim() : "";

  if (!trimmed || trimmed.length > 50) {
    return {
      ok: false,
      message: "Isi teks dengan panjang maksimal 50 karakter.",
    };
  }

  try {
    const response =
      kind === "option"
        ? await productApi.renameOption(productId, targetId, trimmed)
        : await productApi.renameOptionValue(productId, targetId, trimmed);

    return {
      ok: true,
      message: response.message,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof BackendApiError
          ? error.message
          : "Hasil perubahan belum dapat dipastikan. Muat ulang halaman sebelum mencoba kembali.",
    };
  }
}
