export const MAX_PRODUCT_IMAGES = 10;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const MAX_IMAGE_ALT_TEXT = 250;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function validateImageFile(file: File): string | null {
  if (file.size === 0) {
    return "File gambar tidak boleh kosong.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Ukuran gambar maksimal 5 MB.";
  }

  if (!ALLOWED_IMAGE_TYPES.some((type) => type === file.type)) {
    return "Gunakan gambar JPG, PNG, atau WebP.";
  }

  return null;
}
