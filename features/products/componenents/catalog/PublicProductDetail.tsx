"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import ProductGallery from "../shared/ProductGallery";
import ProductIcon from "../shared/ProductIcon";

import type { PublicProductDetailData } from "../../types/public-types";
import type { ProductOptionValue } from "../../types/types";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("id-ID");

type Props = {
  detail: PublicProductDetailData;
};

export default function PublicProductDetail({ detail }: Props) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();

  const { product, store, categoryName } = detail;

  const images = [...detail.images].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.id.localeCompare(b.id),
  );

  const options = [...product.options]
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.id.localeCompare(b.id),
    )
    .map((option) => ({
      ...option,
      values: [...option.values].sort(
        (a, b) =>
          a.sortOrder - b.sortOrder ||
          a.id.localeCompare(b.id),
      ),
    }));

  const [selectedImageId, setSelectedImageId] = useState<
    string | null
  >(images[0]?.id ?? null);

  const [selection, setSelection] = useState<
    Record<string, string>
  >({});

  const [selectedOptionOrder, setSelectedOptionOrder] = useState<
    string[]
  >([]);

  const selectedVariant = product.variants.find(
    (variant) =>
      variant.optionValueIds.length === options.length &&
      options.every((option) =>
        variant.optionValueIds.includes(selection[option.id]),
      ),
  );

  const prices = product.variants.map((variant) => variant.price);

  const minPrice =
    prices.length > 0 ? Math.min(...prices) : product.basePrice;

  const maxPrice =
    prices.length > 0 ? Math.max(...prices) : product.basePrice;

  const hasStock = product.variants.some(
    (variant) => variant.stockQuantity > 0,
  );

  const selectedLabels = options.flatMap((option) => {
    const value = option.values.find(
      (item) => item.id === selection[option.id],
    );

    return value ? [`${option.name}: ${value.value}`] : [];
  });

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  function selectOption(
    optionId: string,
    value: ProductOptionValue,
  ) {
    const deselecting = selection[optionId] === value.id;
    const nextSelection = { ...selection };

    const nextOrder = selectedOptionOrder.filter(
      (id) => id !== optionId,
    );

    if (deselecting) {
      delete nextSelection[optionId];
    } else {
      nextSelection[optionId] = value.id;
      nextOrder.push(optionId);
    }

    setSelection(nextSelection);
    setSelectedOptionOrder(nextOrder);

    let nextImageId: string | null = null;

    for (const id of [...nextOrder].reverse()) {
      const option = options.find((item) => item.id === id);
      const selectedValue = option?.values.find(
        (item) => item.id === nextSelection[id],
      );

      if (
        selectedValue?.imageId &&
        images.some((image) => image.id === selectedValue.imageId)
      ) {
        nextImageId = selectedValue.imageId;
        break;
      }
    }

    setSelectedImageId(nextImageId ?? images[0]?.id ?? null);
  }

  function resetSelection() {
    setSelection({});
    setSelectedOptionOrder([]);
    setSelectedImageId(images[0]?.id ?? null);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        <Link href="/" className="hover:text-primary">
          Beranda
        </Link>

        <span aria-hidden="true">/</span>

        <Link href="/products" className="hover:text-primary">
          Produk
        </Link>

        <span aria-hidden="true">/</span>

        <span
          aria-current="page"
          className="min-w-0 break-words text-foreground"
        >
          {product.title}
        </span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <ProductGallery
          title={product.title}
          images={images}
          selectedImageId={selectedImageId}
          onSelectImage={setSelectedImageId}
          onReload={refresh}
          refreshing={refreshing}
        />

        <section
          aria-labelledby="product-title"
          className="min-w-0 rounded-3xl border border-border bg-surface p-5 sm:p-7"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {categoryName || "Produk"}
          </p>

          <h1
            id="product-title"
            className="mt-3 break-words text-3xl font-semibold tracking-tight text-foreground"
          >
            {product.title}
          </h1>

          <div className="mt-6 rounded-2xl bg-background p-5">
            <p className="text-xs text-muted">
              {selectedVariant
                ? "Harga varian terpilih"
                : minPrice !== maxPrice
                  ? "Rentang harga"
                  : "Harga produk"}
            </p>

            <p className="mt-2 break-words text-2xl font-bold tracking-tight text-primary">
              {selectedVariant
                ? currency.format(selectedVariant.price)
                : minPrice === maxPrice
                  ? currency.format(minPrice)
                  : `${currency.format(minPrice)} – ${currency.format(maxPrice)}`}
            </p>

            <p className="mt-2 text-xs leading-5 text-muted">
              {options.length > 0
                ? "Pilih kombinasi untuk melihat harga dan stok."
                : "Produk ini tersedia tanpa pilihan tambahan."}
            </p>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">
                {options.length > 0
                  ? "Pilih varian"
                  : "Ketersediaan produk"}
              </h2>

              {selectedLabels.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSelection}
                >
                  Reset pilihan
                </Button>
              )}
            </div>

            <div className="mt-5 space-y-6">
              {options.map((option) => (
                <fieldset key={option.id} className="min-w-0">
                  <legend className="text-sm font-medium text-foreground">
                    {option.name}
                  </legend>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const selected =
                        selection[option.id] === value.id;

                      return (
                        <button
                          key={value.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            selectOption(option.id, value)
                          }
                          className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border px-4 py-2 text-left text-sm font-medium transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-background"
                          }`}
                        >
                          <span className="min-w-0 break-words">
                            {value.value}
                          </span>

                          {selected && (
                            <ProductIcon
                              name="check"
                              className="size-4 shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <div
              role="status"
              className="mt-6 rounded-2xl border border-border bg-background p-4"
            >
              {selectedVariant ? (
                <>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedLabels.join(" · ") || "Varian standar"}
                  </p>

                  <p
                    className={`mt-2 text-sm ${
                      selectedVariant.stockQuantity > 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {selectedVariant.stockQuantity > 0
                      ? `Tersedia ${number.format(selectedVariant.stockQuantity)} unit`
                      : "Varian ini sedang habis."}
                  </p>
                </>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  {!hasStock
                    ? "Stok seluruh varian sedang habis."
                    : selectedLabels.length === options.length
                      ? "Kombinasi ini tidak tersedia."
                      : "Pilih seluruh opsi untuk melihat ketersediaan kombinasi."}
                </p>
              )}
            </div>
          </div>

          <dl className="mt-6 border-t border-border pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Berat produk</dt>
              <dd className="font-medium text-foreground">
                {number.format(product.weightGrams)} gram
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section
        aria-labelledby="public-store-heading"
        className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary"
        >
          {Array.from(store.name)[0]?.toUpperCase() || "T"}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted">Dijual oleh</p>

          <h2
            id="public-store-heading"
            className="mt-1 break-words font-semibold text-foreground"
          >
            {store.name}
          </h2>
        </div>
      </section>

      <section
        aria-labelledby="public-description-heading"
        className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7"
      >
        <h2
          id="public-description-heading"
          className="text-lg font-semibold text-foreground"
        >
          Deskripsi produk
        </h2>

        <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-muted [overflow-wrap:anywhere]">
          {product.description?.trim() ||
            "Belum ada deskripsi produk."}
        </p>
      </section>
    </div>
  );
}