"use client";

import {
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import ProductIcon from "../shared/ProductIcon";
import { setProductPublicationAction } from "../../actions/publication-actions";

import type {
  ProductDetail,
  ProductImage,
  ProductPublicationIssue,
} from "../../types/types";

type Props = {
  product: ProductDetail;
  images: ProductImage[];
  galleryError?: string | null;
  disabled?: boolean;
};

export default function ProductPublicationPanel({
  product,
  images,
  galleryError,
  disabled = false,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const busyRef = useRef(false);

  const isActive = product.isActive;
  const [pending, setPending] = useState(false);
  const [refreshing, startTransition] = useTransition();

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<ProductPublicationIssue[]>([]);


  const hasVariants = product.variants.length > 0;

  const hasStock = product.variants.some(
    (variant) => variant.stockQuantity > 0,
  );

  const validPrices =
    hasVariants &&
    product.variants.every(
      (variant) =>
        Number.isFinite(variant.price) &&
        variant.price > 0 &&
        variant.price <= 999_999_999_999.99,
    );

  const validStocks =
    hasVariants &&
    product.variants.every(
      (variant) => variant.stockQuantity >= 0,
    );

  const requirements = [
    {
      label: galleryError
        ? "Galeri belum dapat diperiksa"
        : "Minimal satu foto produk",
      complete: !galleryError && images.length > 0,
    },
    {
      label: "Minimal satu varian tersedia",
      complete: hasVariants,
    },
    {
      label: "Minimal satu varian memiliki stok",
      complete: hasStock && validStocks,
    },
    {
      label: "Harga seluruh varian valid dan positif",
      complete: validPrices,
    },
  ];

  const completedCount = requirements.filter(
    (item) => item.complete,
  ).length;

  const ready = completedCount === requirements.length;
  const busy = pending || refreshing || disabled;

  async function changePublication(nextActive: boolean) {
    if (busyRef.current || busy) return;

    busyRef.current = true;
    setPending(true);
    setNotice("");
    setError("");
    setIssues([]);

    try {
      const result = await setProductPublicationAction(
        product.id,
        nextActive,
      );

      if (!result.ok) {
        setError(result.message);
        setIssues(result.issues);
        return;
      }

      setNotice(result.message);
      dialogRef.current?.close();

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError(
        "Status terbaru belum dapat dipastikan. Muat ulang halaman sebelum mencoba kembali.",
      );
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  }

  return (
    <section
      aria-labelledby="publication-heading"
      aria-busy={busy}
      className="overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2
              id="publication-heading"
              className="text-lg font-semibold text-foreground"
            >
              Status publikasi
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-success-soft text-success"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isActive ? "Aktif" : "Belum dipublikasikan"}
            </span>
          </div>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {isActive
              ? "Produk tersedia di katalog pembeli. Nonaktifkan jika ingin menyembunyikannya sementara."
              : "Lengkapi foto, harga, dan stok sebelum menampilkan produk di katalog pembeli."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {isActive ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => dialogRef.current?.showModal()}
              >
                Nonaktifkan produk
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={pending}
                disabled={busy || !ready}
                icon={<ProductIcon name="check" className="size-4" />}
                onClick={() => changePublication(true)}
              >
                Publikasikan produk
              </Button>
            )}

            <Button
              variant="ghost"
              disabled={busy}
              icon={<ProductIcon name="refresh" className="size-4" />}
              onClick={() =>
                startTransition(() => router.refresh())
              }
            >
              Periksa ulang
            </Button>
          </div>

          {!isActive && !ready && (
            <p className="mt-3 text-xs leading-5 text-muted">
              Tombol publikasi tersedia setelah semua persyaratan
              terpenuhi.
            </p>
          )}

          {isActive && !hasStock && (
            <p className="mt-4 rounded-xl bg-background px-4 py-3 text-sm leading-6 text-muted">
              Stok seluruh varian habis. Produk tetap aktif;
              perbarui persediaan agar dapat dibeli kembali.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Kelengkapan produk
            </h3>

            <span className="text-xs font-medium text-muted">
              {completedCount}/{requirements.length}
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {requirements.map((item) => (
              <li
                key={item.label}
                className="flex items-start gap-3 text-sm"
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                    item.complete
                      ? "bg-success-soft text-success"
                      : "border border-border bg-surface text-muted"
                  }`}
                >
                  {item.complete ? (
                    <ProductIcon name="check" className="size-3" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>

                <span className="text-muted">
                  <span className="sr-only">
                    {item.complete ? "Terpenuhi: " : "Belum terpenuhi: "}
                  </span>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="border-t border-success/15 bg-success-soft px-5 py-4 text-sm text-success sm:px-7"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="border-t border-danger/15 bg-danger-soft px-5 py-4 text-sm text-danger sm:px-7"
        >
          <p className="font-semibold">{error}</p>

          {issues.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {issues.map((issue) => (
                <li key={issue.code}>{issue.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="unpublish-heading"
        onCancel={(event) => {
          if (busyRef.current) {
            event.preventDefault();
          }
        }}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6 text-foreground shadow-2xl backdrop:bg-panel/60 backdrop:backdrop-blur-sm sm:p-8"
      >
        <h2
          id="unpublish-heading"
          className="text-xl font-semibold"
        >
          Nonaktifkan produk?
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted">
          Produk akan disembunyikan dari katalog pembeli.
          Foto, pilihan varian, harga, dan stok tetap tersimpan.
          Kamu dapat mempublikasikannya kembali nanti.
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            autoFocus
            variant="outline"
            disabled={pending}
            onClick={() => dialogRef.current?.close()}
          >
            Batal
          </Button>

          <Button
            variant="danger"
            loading={pending}
            onClick={() => changePublication(false)}
          >
            Nonaktifkan
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}
      </dialog>
    </section>
  );
}