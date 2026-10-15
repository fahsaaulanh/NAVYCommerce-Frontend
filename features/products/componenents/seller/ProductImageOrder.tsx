"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import ProductIcon from "../shared/ProductIcon";
import { reorderProductImagesAction } from "../../actions/image-actions";
import type { ProductImage } from "../../types/types";

type ProductImageOrderProps = {
  productId: string;
  images: ProductImage[];
  disabled?: boolean;
  onSaved: (firstImageId: string, message: string) => void;
};

export default function ProductImageOrder({
  productId,
  images,
  disabled = false,
  onSaved,
}: ProductImageOrderProps) {
  const editorId = useId();
  const submittingRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const [orderIds, setOrderIds] = useState<string[]>(() =>
    images.map((image) => image.id),
  );

  const savedIds = images.map((image) => image.id);

  const imageById = new Map(
    images.map((image) => [image.id, image]),
  );

  const changed =
    orderIds.length !== savedIds.length ||
    orderIds.some((id, index) => id !== savedIds[index]);

  const busy = pending || disabled;

  function resetOrder() {
    setOrderIds(savedIds);
    setError(null);
    setAnnouncement("");
  }

  function moveImage(index: number, direction: -1 | 1) {
    if (busy) {
      return;
    }

    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= orderIds.length) {
      return;
    }

    const nextOrder = [...orderIds];

    [nextOrder[index], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[index],
    ];

    setOrderIds(nextOrder);
    setError(null);

    setAnnouncement(
      `Gambar nomor ${index + 1} dipindahkan ke posisi ${targetIndex + 1}.`,
    );
  }

  async function saveOrder() {
    if (busy || submittingRef.current || !changed) {
      return;
    }

    submittingRef.current = true;
    setPending(true);
    setError(null);

    try {
      const result = await reorderProductImagesAction(
        productId,
        orderIds,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setOpen(false);
      onSaved(orderIds[0], result.message);
    } catch {
      setError(
        "Hasil perubahan belum dapat dikonfirmasi. Muat ulang galeri.",
      );
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  if (images.length < 2) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Urutan galeri
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted">
            Gambar di posisi pertama ditampilkan lebih awal di galeri.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<ProductIcon name="order" className="size-4" />}
          disabled={busy}
          aria-expanded={open}
          aria-controls={editorId}
          onClick={() => {
            resetOrder();
            setOpen((current) => !current);
          }}
        >
          {open ? "Tutup pengaturan" : "Atur urutan"}
        </Button>
      </div>

      <div id={editorId} hidden={!open}>
        <p className="mt-4 text-xs leading-5 text-muted">
          Gunakan tombol naik atau turun. Perubahan baru berlaku
          setelah disimpan.
        </p>

        <ol className="mt-3 space-y-2">
          {orderIds.map((id, index) => {
            const image = imageById.get(id);

            if (!image) {
              return null;
            }

            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold text-muted">
                  {index + 1}
                </span>

                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-background">
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words text-xs font-medium leading-5 text-foreground">
                    {image.altText || `Gambar ${index + 1}`}
                  </p>

                  {index === 0 && (
                    <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Posisi pertama
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={
                      <ProductIcon name="up" className="size-4" />
                    }
                    disabled={busy || index === 0}
                    onClick={() => moveImage(index, -1)}
                  >
                    Naikkan {image.altText || "gambar"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    icon={
                      <ProductIcon name="down" className="size-4" />
                    }
                    disabled={
                      busy || index === orderIds.length - 1
                    }
                    onClick={() => moveImage(index, 1)}
                  >
                    Turunkan {image.altText || "gambar"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>

        <p role="status" className="sr-only">
          {announcement}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-danger-soft p-3 text-sm leading-6 text-danger"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-muted">
            {changed
              ? "Ada perubahan yang belum disimpan."
              : "Urutan sesuai data yang tersimpan."}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => {
                resetOrder();
                setOpen(false);
              }}
            >
              Batal
            </Button>

            <Button
              size="sm"
              icon={
                <ProductIcon name="check" className="size-4" />
              }
              loading={pending}
              disabled={disabled || !changed}
              onClick={saveOrder}
            >
              Simpan urutan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}