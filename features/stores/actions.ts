"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { deleteSession } from "@/lib/auth/session";
import { BackendApiError } from "@/lib/api/server";
import { storeApi } from "./store-api";
import type { CreateStoreState } from "./types";

export async function createStoreAction(
  _previousState: CreateStoreState,
  formData: FormData,
): Promise<CreateStoreState> {
  await requireRole(["Seller"]);

  const readText = (field: string): string => {
    const value = formData.get(field);
    return typeof value === "string" ? value.trim() : "";
  };

  const name = readText("name");
  const slug = readText("slug");
  const description = readText("description");

  const errors: NonNullable<CreateStoreState["errors"]> = {};

  if (name.length < 2 || name.length > 150) {
    errors.name = "Nama toko harus terdiri dari 2–150 karakter.";
  }

  if (!slug || slug.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug =
      "Gunakan huruf kecil, angka, dan tanda hubung di antara kata. Maksimal 160 karakter.";
  }

  if (description.length > 2000) {
    errors.description = "Deskripsi maksimal 2000 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      message: "Periksa kembali data toko.",
      errors,
    };
  }

  try {
    await storeApi.create({
      name,
      slug,
      description: description || null,
    });
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    if (error.status === 401) {
      await deleteSession();
      redirect("/auth");
    }

    if (error.code === "STORE_SLUG_ALREADY_USED") {
      return {
        message: "Slug sudah digunakan. Pilih slug lainnya.",
        errors: {
          slug: "Slug toko ini sudah digunakan.",
        },
      };
    }

    const backendErrors: NonNullable<CreateStoreState["errors"]> = {};

    for (const [field, messages] of Object.entries(error.fieldErrors)) {
      const key = field.toLowerCase();

      if (key === "name" || key === "slug" || key === "description") {
        backendErrors[key] = messages.join(" ");
      }
    }

    return {
      message: error.message,
      errors: backendErrors,
    };
  }

  revalidatePath("/seller/stores");
  redirect("/seller/stores");
}
