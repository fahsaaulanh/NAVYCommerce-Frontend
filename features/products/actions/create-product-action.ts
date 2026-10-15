"use server";

import { getSession } from "@/lib/auth/session";
import { BackendApiError } from "@/lib/api/server";
import { productApi } from "../api/product-api";

import type {
  CreateProductActionResult,
  CreateProductOptionPayload,
  CreateProductPayload,
} from "../types/types";

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function failure(
  message: string,
  fieldErrors: Record<string, string[]> = {},
): CreateProductActionResult {
  return {
    ok: false,
    message,
    fieldErrors,
  };
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function parseOptions(raw: string): CreateProductOptionPayload[] | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length > 3) {
    return null;
  }

  const options: CreateProductOptionPayload[] = [];
  const optionNames = new Set<string>();
  let combinationCount = 1;

  for (const item of parsed) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return null;
    }

    const option = item as Record<string, unknown>;

    if (typeof option.name !== "string" || !Array.isArray(option.values)) {
      return null;
    }

    const name = option.name.trim();
    const normalizedName = name.toLowerCase();

    if (
      !name ||
      name.length > 50 ||
      optionNames.has(normalizedName) ||
      option.values.length === 0 ||
      option.values.length > 20
    ) {
      return null;
    }

    const values: string[] = [];
    const uniqueValues = new Set<string>();

    for (const rawValue of option.values) {
      if (typeof rawValue !== "string") {
        return null;
      }

      const value = rawValue.trim();
      const normalizedValue = value.toLowerCase();

      if (!value || value.length > 50 || uniqueValues.has(normalizedValue)) {
        return null;
      }

      uniqueValues.add(normalizedValue);
      values.push(value);
    }

    combinationCount *= values.length;

    if (combinationCount > 100) {
      return null;
    }

    optionNames.add(normalizedName);
    options.push({ name, values });
  }

  return options;
}

export async function createProductAction(
  storeId: string,
  formData: FormData,
): Promise<CreateProductActionResult> {
  const user = await getSession();

  if (!user) {
    return failure("Sesi berakhir. Silakan login kembali.");
  }

  if (user.role !== "Seller") {
    return failure("Akunmu tidak memiliki izin membuat produk.");
  }

  if (
    !guidPattern.test(storeId) ||
    storeId === "00000000-0000-0000-0000-000000000000"
  ) {
    return failure("Identitas toko tidak valid.");
  }

  const title = readText(formData, "title");
  const slug = readText(formData, "slug");
  const description = readText(formData, "description");

  const categoryText = readText(formData, "categoryId");
  const weightText = readText(formData, "weightGrams");
  const priceText = readText(formData, "basePrice");
  const optionsText = readText(formData, "options");

  const categoryId = Number(categoryText);
  const weightGrams = Number(weightText);
  const basePrice = Number(priceText);

  const options = parseOptions(optionsText);
  const fieldErrors: Record<string, string[]> = {};

  if (!title) {
    fieldErrors.title = ["Nama produk wajib diisi."];
  }

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fieldErrors.slug = [
      "Gunakan huruf kecil, angka, dan tanda hubung untuk slug.",
    ];
  }

  if (
    !/^\d+$/.test(categoryText) ||
    !Number.isSafeInteger(categoryId) ||
    categoryId < 1 ||
    categoryId > 2_147_483_647
  ) {
    fieldErrors.categoryId = ["Pilih kategori produk."];
  }

  if (
    !/^\d+$/.test(weightText) ||
    !Number.isSafeInteger(weightGrams) ||
    weightGrams < 1 ||
    weightGrams > 2_147_483_647
  ) {
    fieldErrors.weightGrams = [
      "Berat harus berupa bilangan bulat positif dalam gram.",
    ];
  }

  if (
    !/^\d+(?:\.\d{1,2})?$/.test(priceText) ||
    !Number.isFinite(basePrice) ||
    basePrice <= 0 ||
    basePrice > 999_999_999_999.99
  ) {
    fieldErrors.basePrice = [
      "Isi harga positif dengan maksimal dua angka desimal.",
    ];
  }

  if (options === null) {
    fieldErrors.options = [
      "Periksa pilihan varian. Maksimal 3 opsi, 20 nilai per opsi, dan 100 kombinasi. Nama dan nilai tidak boleh duplikat.",
    ];
  }

  if (Object.keys(fieldErrors).length > 0 || options === null) {
    return failure("Periksa kembali data produk.", fieldErrors);
  }

  const payload: CreateProductPayload = {
    storeId,
    categoryId,
    title,
    slug,
    description: description || null,
    weightGrams,
    basePrice,
    options,
  };

  try {
    const response = await productApi.create(payload);

    return {
      ok: true,
      productId: response.data.id,
    };
  } catch (error) {
    if (error instanceof BackendApiError) {
      return failure(error.message, error.fieldErrors);
    }

    return failure(
      "Hasil penyimpanan belum dapat dipastikan. Periksa daftar produk sebelum mencoba kembali.",
    );
  }
}
