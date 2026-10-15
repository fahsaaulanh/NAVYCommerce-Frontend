"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import Button from "@/components/ui/Button";
import ProductIcon from "./ProductIcon";
import type { ProductImage } from "../../types/types";

type Props = {
  title: string;
  images: ProductImage[];
  selectedImageId: string | null;
  onSelectImage: (imageId: string) => void;
  onReload: () => void;
  refreshing: boolean;
};

export default function ProductGallery({
  title,
  images,
  selectedImageId,
  onSelectImage,
  onReload,
  refreshing,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const activeImage =
    images.find((image) => image.id === selectedImageId) ??
    images[0] ??
    null;

  const activeIndex = activeImage
    ? images.findIndex((image) => image.id === activeImage.id)
    : -1;

  function moveImage(direction: number) {
    if (images.length < 2) return;

    const nextIndex =
      (activeIndex + direction + images.length) % images.length;

    onSelectImage(images[nextIndex].id);
  }

  return (
    <section aria-label="Galeri produk" className="min-w-0">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-background">
        {!activeImage ? (
          <div className="px-6 text-center text-muted">
            <ProductIcon
              name="image"
              className="mx-auto size-12"
            />

            <p className="mt-4 text-sm">
              Foto produk belum tersedia.
            </p>
          </div>
        ) : failedUrl === activeImage.url ? (
          <div className="max-w-sm px-6 text-center">
            <ProductIcon
              name="alert"
              className="mx-auto size-10 text-muted"
            />

            <p role="alert" className="mt-4 text-sm text-muted">
              Foto belum dapat ditampilkan. Muat ulang untuk
              mendapatkan tautan terbaru.
            </p>

            <Button
              variant="outline"
              loading={refreshing}
              onClick={onReload}
              className="mt-5"
            >
              Muat ulang foto
            </Button>
          </div>
        ) : (
          <>
            <Image
              key={activeImage.url}
              src={activeImage.url}
              alt={activeImage.altText || title}
              fill
              unoptimized
              sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
              className="object-contain p-5"
              onError={() => setFailedUrl(activeImage.url)}
            />

            <button
              type="button"
              onClick={() => dialogRef.current?.showModal()}
              className="absolute bottom-4 left-4 rounded-xl border border-border bg-surface/95 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background"
            >
              Perbesar foto
            </button>
          </>
        )}

        {activeImage && (
          <span className="absolute right-4 top-4 rounded-full bg-panel/85 px-3 py-1.5 text-xs font-medium text-on-panel">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          {images.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              icon={<ProductIcon name="back" className="size-4" />}
              onClick={() => moveImage(-1)}
            >
              Foto sebelumnya
            </Button>
          )}

          <ul
            aria-label="Pilih foto produk"
            className="flex min-w-0 flex-1 gap-3 overflow-x-auto py-2"
          >
            {images.map((image, index) => (
              <li key={image.id} className="shrink-0">
                <button
                  type="button"
                  aria-label={`Foto ${index + 1}: ${
                    image.altText || title
                  }`}
                  aria-pressed={image.id === activeImage?.id}
                  onClick={() => onSelectImage(image.id)}
                  className={`relative size-20 overflow-hidden rounded-xl border-2 bg-background transition-colors ${
                    image.id === activeImage?.id
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </button>
              </li>
            ))}
          </ul>

          {images.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              icon={
                <ProductIcon
                  name="back"
                  className="size-4 rotate-180"
                />
              }
              onClick={() => moveImage(1)}
            >
              Foto berikutnya
            </Button>
          )}
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`Foto produk ${title}`}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-3xl border border-border bg-surface p-4 text-foreground shadow-2xl backdrop:bg-panel/70 backdrop:backdrop-blur-sm sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="min-w-0 truncate text-sm font-semibold">
            {activeImage?.altText || title}
          </p>

          <Button
            autoFocus
            variant="outline"
            size="sm"
            onClick={() => dialogRef.current?.close()}
          >
            Tutup
          </Button>
        </div>

        {activeImage && (
          <div className="relative mt-4 aspect-[4/3] max-h-[65dvh] rounded-2xl bg-background">
            <Image
              src={activeImage.url}
              alt={activeImage.altText || title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 850px, 100vw"
              className="object-contain p-3"
            />
          </div>
        )}
      </dialog>
    </section>
  );
}