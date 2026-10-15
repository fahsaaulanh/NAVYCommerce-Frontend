"use client";

import Image from "next/image";
import {
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";
import ProductIcon from "../shared/ProductIcon";
import { setProductOptionImageAction } from "../../actions/image-actions";
import type {
  ProductImage,
  ProductOption,
  ProductOptionValue,
} from "../../types/types";

type ProductOptionImagesProps = {
  productId: string;
  options: ProductOption[];
  images: ProductImage[];
  disabled?: boolean;
  onSaved: (imageId: string | null, message: string) => void;
};

export default function ProductOptionImages({
  productId,
  options,
  images,
  disabled = false,
  onSaved,
}: ProductOptionImagesProps) {
  if (options.length === 0) {
    return null;
  }

  const linkedCount = options.reduce(
    (total, option) =>
      total + option.values.filter((value) => value.imageId).length,
    0,
  );

  return (
    <section
      id="product-option-images"
      aria-labelledby="option-images-heading"
      className="scroll-mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ProductIcon name="image" />
          </div>

          <div>
            <h2
              id="option-images-heading"
              className="text-lg font-semibold text-foreground"
            >
              Gambar pilihan produk
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              Hubungkan gambar ke warna atau model yang mengubah
              tampilan produk. Opsi ukuran boleh tanpa gambar.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted">
          {linkedCount} pilihan terhubung
        </span>
      </div>

      {images.length === 0 && (
        <p className="mt-4 rounded-xl border border-border bg-background p-3 text-sm text-muted">
          Upload gambar produk terlebih dahulu untuk menghubungkannya
          dengan pilihan produk.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {options.map((option) => (
          <details
            key={option.id}
            className="group overflow-hidden rounded-2xl border border-border"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-background/60 p-4 transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {option.name}
                </span>

                <span className="mt-1 block text-xs text-muted">
                  {option.values.length} pilihan
                </span>
              </span>

              <ProductIcon
                name="down"
                className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>

            <div className="divide-y divide-border border-t border-border">
              {option.values.map((value) => (
                <OptionImageRow
                  key={`${value.id}:${value.imageId ?? "none"}`}
                  productId={productId}
                  optionName={option.name}
                  value={value}
                  images={images}
                  disabled={disabled}
                  onSaved={onSaved}
                />
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

type OptionImageRowProps = {
  productId: string;
  optionName: string;
  value: ProductOptionValue;
  images: ProductImage[];
  disabled: boolean;
  onSaved: (imageId: string | null, message: string) => void;
};

function OptionImageRow({
  productId,
  optionName,
  value,
  images,
  disabled,
  onSaved,
}: OptionImageRowProps) {
  const selectId = useId();
  const busyRef = useRef(false);

  const [selectedId, setSelectedId] = useState(value.imageId ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const savedId = value.imageId ?? "";
  const changed = selectedId !== savedId;
  const busy = pending || disabled;

  const selectedImage = images.find(
    (image) => image.id === selectedId,
  );

  const savedImageMissing =
    savedId !== "" &&
    !images.some((image) => image.id === savedId);

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy || busyRef.current || !changed) {
      return;
    }

    busyRef.current = true;
    setPending(true);
    setError(null);

    try {
      const result = await setProductOptionImageAction(
        productId,
        value.id,
        selectedId || null,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      onSaved(selectedId || null, result.message);
    } catch {
      setError(
        "Hasil perubahan belum dapat dikonfirmasi. Muat ulang halaman.",
      );
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
          <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
            {selectedImage && failedUrl !== selectedImage.url ? (
              <Image
                key={selectedImage.url}
                src={selectedImage.url}
                alt={`Preview ${optionName}: ${value.value}`}
                fill
                unoptimized
                sizes="64px"
                className="object-contain p-1"
                onError={() => setFailedUrl(selectedImage.url)}
              />
            ) : (
              <ProductIcon
                name="image"
                className="size-6 text-muted"
              />
            )}
          </div>

          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-foreground">
              {value.value}
            </p>

            <p className="mt-1 text-xs text-muted">
              {changed
                ? "Belum disimpan"
                : value.imageId
                  ? "Gambar terhubung"
                  : "Tanpa gambar"}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-foreground"
          >
            Gambar untuk {optionName}: {value.value}
          </label>

          <select
            id={selectId}
            value={selectedId}
            disabled={busy}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setError(null);
            }}
            className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          >
            <option value="">Tanpa gambar</option>

            {savedImageMissing && (
              <option value={savedId} disabled>
                Gambar tersimpan belum tersedia
              </option>
            )}

            {images.map((image, index) => (
              <option key={image.id} value={image.id}>
                Foto {index + 1} — {image.altText || "Tanpa deskripsi"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 sm:self-end">
          <Button
            variant="outline"
            size="sm"
            disabled={busy || !changed}
            onClick={() => {
              setSelectedId(savedId);
              setError(null);
            }}
          >
            Batal
          </Button>

          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={pending}
            disabled={disabled || !changed}
            icon={<ProductIcon name="check" className="size-4" />}
          >
            Simpan
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-danger-soft p-3 text-sm leading-6 text-danger"
        >
          {error}
        </p>
      )}
    </form>
  );
}