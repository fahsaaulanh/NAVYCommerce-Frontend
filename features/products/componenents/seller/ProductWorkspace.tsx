"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import Button from "@/components/ui/Button";
import ProductIcon from "../shared/ProductIcon";
import type {
  ProductDetail,
  ProductImage,
  ProductOptionValue,
} from "../../types/types";
import ProductImageUpload from "./ProductImageUpload";
import ProductImageControls from "./ProductImageControls";
import ProductImageOrder from "./ProductImageOrder";
import ProductOptionImages from "./ProductOptionImages";
import ProductVariantEditor from "./ProductVariantEditor";
import ProductPublicationPanel from "./ProductPublicationPanel";
import ProductOptionEditor from "./ProductOptionEditor";

type ProductWorkspaceProps = {
  product: ProductDetail;
  images: ProductImage[];
  galleryError?: string;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("id-ID");

const date = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
});

export default function ProductWorkspace({
  product,
  images,
  galleryError,
}: ProductWorkspaceProps) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();

  const [selectedImageId, setSelectedImageId] = useState<string | null>(
    images[0]?.id ?? null,
  );

  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const [selection, setSelection] = useState<Record<string, string>>({});

  const [selectedOptionOrder, setSelectedOptionOrder] = useState<
    string[]
  >([]);

  const [galleryNotice, setGalleryNotice] = useState<string | null>(
    null,
  );
  const [variantNotice, setVariantNotice] = useState<string | null>(
    null,
  );

  const gallery = [...images].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const options = [...product.options]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((option) => ({
      ...option,
      values: [...option.values].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    }));

  const activeImage =
    gallery.find((image) => image.id === selectedImageId) ??
    gallery[0];

  const activeImageIndex = activeImage
    ? gallery.findIndex((image) => image.id === activeImage.id)
    : -1;

  const selectedVariant = product.variants.find(
    (variant) =>
      variant.optionValueIds.length === options.length &&
      options.every(
        (option) =>
          selection[option.id] &&
          variant.optionValueIds.includes(selection[option.id]),
      ),
  );

  const totalStock = product.variants.reduce(
    (total, variant) => total + variant.stockQuantity,
    0,
  );

  const valueLabels = new Map(
    options.flatMap((option) =>
      option.values.map(
        (value) =>
          [value.id, `${option.name}: ${value.value}`] as const,
      ),
    ),
  );

  const stats = [
    {
      label: "Harga dasar",
      value: currency.format(product.basePrice),
      icon: "box" as const,
    },
    {
      label: "Total stok",
      value: `${number.format(totalStock)} unit`,
      icon: "layers" as const,
    },
    {
      label: "Kombinasi varian",
      value: number.format(product.variants.length),
      icon: "layers" as const,
    },
    {
      label: "Galeri gambar",
      value: galleryError ? "Belum tersedia" : `${gallery.length} foto`,
      icon: "image" as const,
    },
  ];

  function refresh() {
    startRefresh(() => {
      router.refresh();
    });
  }

  function selectOption(
    optionId: string,
    value: ProductOptionValue,
  ) {
    const isDeselecting = selection[optionId] === value.id;

    const nextSelection = { ...selection };

    const nextOrder = selectedOptionOrder.filter(
      (id) => id !== optionId,
    );

    if (isDeselecting) {
      delete nextSelection[optionId];
    } else {
      nextSelection[optionId] = value.id;

      nextOrder.push(optionId);
    }

    setSelection(nextSelection);
    setSelectedOptionOrder(nextOrder);

    let nextImageId: string | null = null;

    for (const selectedOptionId of [...nextOrder].reverse()) {
      const option = options.find(
        (item) => item.id === selectedOptionId,
      );

      const selectedValue = option?.values.find(
        (item) => item.id === nextSelection[selectedOptionId],
      );

      const imageExists = gallery.some(
        (image) => image.id === selectedValue?.imageId,
      );

      if (selectedValue?.imageId && imageExists) {
        nextImageId = selectedValue.imageId;
        break;
      }
    }

    setSelectedImageId(nextImageId ?? gallery[0]?.id ?? null);
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        <Link
          href="/seller/stores"
          className="transition-colors hover:text-primary"
        >
          Toko saya
        </Link>

        <span aria-hidden="true">/</span>

        <Link
          href={`/seller/stores/${product.storeId}`}
          className="transition-colors hover:text-primary"
        >
          Detail toko
        </Link>

        <span aria-hidden="true">/</span>

        <span aria-current="page" className="font-medium text-foreground">
          Detail produk
        </span>
      </nav>

      <header className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-action-start to-action-end"
        />

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Katalog toko
              </span>

              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                  product.isActive
                    ? "bg-success-soft text-success"
                    : "bg-primary/10 text-primary",
                ].join(" ")}
              >
                {product.isActive && (
                  <ProductIcon name="check" className="size-3.5" />
                )}
                {product.isActive ? "Aktif" : "Draft"}
              </span>
            </div>

            <h1 className="mt-3 break-words text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {product.title}
            </h1>

            <p className="mt-3 break-all text-sm text-muted">
              /{product.slug}
            </p>

            <p className="mt-3 text-xs text-muted">
              Dibuat{" "}
              <time dateTime={product.createdAt}>
                {date.format(new Date(product.createdAt))}
              </time>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/seller/stores/${product.storeId}`}
              className="action-button action-button--outline"
            >
              <ProductIcon name="back" className="size-4" />
              Kembali ke toko
            </Link>

            <Button
              variant="secondary"
              icon={<ProductIcon name="refresh" className="size-4" />}
              loading={refreshing}
              onClick={refresh}
            >
              Muat ulang
            </Button>
          </div>
        </div>

        <nav
          aria-label="Bagian detail produk"
          className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5"
        >
          <a
            href="#product-gallery"
            className="action-button action-button--ghost action-button--sm"
          >
            <ProductIcon name="image" className="size-4" />
            Galeri & opsi
          </a>

          <a
            href="#product-variants"
            className="action-button action-button--ghost action-button--sm"
          >
            <ProductIcon name="layers" className="size-4" />
            Daftar varian
          </a>
        </nav>
      </header>

      <ProductPublicationPanel
        product={product}
        images={images}
        galleryError={galleryError}
      />

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <ProductIcon name={stat.icon} />
            </div>

            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted">
                {stat.label}
              </dt>

              <dd className="mt-2 break-words text-xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      {totalStock === 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <ProductIcon
            name="alert"
            className="mt-0.5 size-5 shrink-0 text-foreground"
          />

          <p className="text-sm leading-6 text-foreground">
            Semua varian masih memiliki stok 0. Isi stok varian sebelum
            produk siap dijual.
          </p>
        </div>
      )}

      <div
        id="product-gallery"
        className="grid scroll-mt-6 gap-6 xl:h-[860px] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)]"
      >
        <section
          aria-labelledby="gallery-heading"
          className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-surface p-5 sm:p-6"
        >
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div>
              <h2
                id="gallery-heading"
                tabIndex={-1}
                className="text-lg font-semibold text-foreground"
              >
                Galeri produk
              </h2>

              <p className="mt-1 text-sm text-muted">
                Pilih thumbnail untuk melihat gambar.
              </p>
            </div>

            {!galleryError && (
              <span className="shrink-0 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
                {gallery.length}/10 foto
              </span>
            )}
          </div>

          <div className="relative mt-5 flex aspect-[4/3] max-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-background xl:min-h-0 xl:flex-1 xl:aspect-auto xl:max-h-none">
            {galleryError ? (
              <div className="max-w-sm px-6 text-center">
                <ProductIcon
                  name="alert"
                  className="mx-auto size-10 text-muted"
                />

                <p role="alert" className="mt-4 text-sm text-muted">
                  {galleryError}
                </p>

                <Button
                  variant="outline"
                  loading={refreshing}
                  onClick={refresh}
                  className="mt-5"
                >
                  Coba kembali
                </Button>
              </div>
            ) : !activeImage ? (
              <div className="px-6 text-center">
                <ProductIcon
                  name="image"
                  className="mx-auto size-12 text-muted"
                />

                <p className="mt-4 font-semibold text-foreground">
                  Belum ada gambar produk
                </p>

                <p className="mt-2 text-sm text-muted">
                  Tambahkan foto melalui bagian pengelolaan gambar.
                </p>
              </div>
            ) : failedUrl === activeImage.url ? (
              <div className="max-w-sm px-6 text-center">
                <ProductIcon
                  name="alert"
                  className="mx-auto size-10 text-muted"
                />

                <p role="alert" className="mt-4 text-sm text-muted">
                  Gambar belum dapat ditampilkan. Muat ulang untuk
                  mendapatkan tautan gambar terbaru.
                </p>

                <Button
                  variant="outline"
                  loading={refreshing}
                  onClick={refresh}
                  className="mt-5"
                >
                  Muat ulang gambar
                </Button>
              </div>
            ) : (
              <>
                <Image
                  key={activeImage.url}
                  src={activeImage.url}
                  alt={activeImage.altText || product.title}
                  fill
                  unoptimized
                  sizes="(min-width: 1280px) 560px, 100vw"
                  className="object-contain p-3"
                  onError={() => setFailedUrl(activeImage.url)}
                />

                <span className="absolute bottom-3 right-3 rounded-full bg-panel/85 px-3 py-1.5 text-xs font-medium text-on-panel">
                  {activeImageIndex + 1} / {gallery.length}
                </span>
              </>
            )}
          </div>

          {gallery.length > 0 && (
            <ul
              aria-label="Thumbnail gambar produk"
              className="mt-4 flex shrink-0 gap-3 overflow-x-auto pb-2"
            >
              {gallery.map((image, index) => (
                <li key={image.id} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`Tampilkan gambar ${index + 1}: ${image.altText || product.title
                      }`}
                    aria-pressed={image.id === activeImage?.id}
                    onClick={() => setSelectedImageId(image.id)}
                    className={[
                      "relative size-20 overflow-hidden rounded-xl border-2 bg-background transition-colors",
                      image.id === activeImage?.id
                        ? "border-primary"
                        : "border-border hover:border-primary/50",
                    ].join(" ")}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      unoptimized
                      sizes="80px"
                      className="object-contain p-1"
                    />

                    {index === 0 && (
                      <span className="absolute inset-x-0 bottom-0 bg-panel/85 py-0.5 text-[10px] font-medium text-on-panel">
                        Pertama
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {activeImage && !galleryError && (
            <div
              role="region"
              aria-label="Pengaturan gambar terpilih"
              tabIndex={0}
              className="mt-4 shrink-0 overflow-y-auto overscroll-contain rounded-2xl xl:max-h-[180px]"
            >
              <ProductImageControls
                key={`${activeImage.id}:${activeImage.altText}`}
                productId={product.id}
                image={activeImage}
                disabled={refreshing}
                usedBy={options.flatMap((option) =>
                  option.values
                    .filter((value) => value.imageId === activeImage.id)
                    .map((value) => `${option.name}: ${value.value}`),
                )}
                onUpdated={(message) => {
                  setGalleryNotice(message);
                  refresh();
                }}
                onDeleted={(message) => {
                  setGalleryNotice(message);
                  setSelectedImageId(null);
                  document.getElementById("gallery-heading")?.focus();
                  refresh();
                }}
              />
            </div>
          )}
        </section>

        <div className="grid min-h-0 min-w-0 gap-6 xl:grid-rows-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section
            aria-labelledby="product-information-heading"
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-surface p-6"
          >
            <h2
              id="product-information-heading"
              className="shrink-0 text-lg font-semibold text-foreground"
            >
              Informasi produk
            </h2>

            <dl className="mt-5 grid shrink-0 grid-cols-2 gap-5">
              <div className="min-w-0">
                <dt className="text-xs text-muted">Harga dasar</dt>

                <dd className="mt-2 break-words text-xl font-semibold text-primary">
                  {currency.format(product.basePrice)}
                </dd>
              </div>

              <div className="min-w-0">
                <dt className="text-xs text-muted">Berat produk</dt>

                <dd className="mt-2 break-words font-semibold text-foreground">
                  {number.format(product.weightGrams)} gram
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex min-h-0 flex-1 flex-col border-t border-border pt-5">
              <h3
                id="product-description-heading"
                className="shrink-0 text-sm font-semibold text-foreground"
              >
                Deskripsi
              </h3>

              <div
                role="region"
                aria-labelledby="product-description-heading"
                tabIndex={0}
                className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-lg pr-3"
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted [overflow-wrap:anywhere]">
                  {product.description?.trim() ||
                    "Belum ada deskripsi produk."}
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="variant-preview-heading"
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-surface p-6"
          >
            <div className="shrink-0">
              <h2
                id="variant-preview-heading"
                className="text-lg font-semibold text-foreground"
              >
                Preview pilihan varian
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Pilih kombinasi untuk melihat harga dan stoknya.
              </p>
            </div>

            <div
              role="region"
              aria-label="Pilihan varian produk"
              tabIndex={0}
              className="mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain rounded-lg pr-3"
            >
              {options.map((option) => (
                <fieldset key={option.id} className="min-w-0">
                  <legend className="max-w-full break-words text-sm font-semibold text-foreground">
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
                          onClick={() => selectOption(option.id, value)}
                          className={[
                            "inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border px-4 py-2 text-left text-sm font-medium transition-colors",
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-background",
                          ].join(" ")}
                        >
                          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
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

              {options.length === 0 && (
                <p className="text-sm text-muted">
                  Produk ini tidak memiliki pilihan opsi.
                </p>
              )}
            </div>

            <div
              aria-live="polite"
              className="mt-5 flex min-h-[104px] shrink-0 items-center rounded-2xl border border-border bg-background p-4"
            >
              {selectedVariant ? (
                <div className="flex w-full flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted">
                      Harga kombinasi
                    </p>

                    <p className="mt-1 break-words text-xl font-semibold text-foreground">
                      {currency.format(selectedVariant.price)}
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-semibold",
                      selectedVariant.stockQuantity > 0
                        ? "bg-success-soft text-success"
                        : "bg-danger-soft text-danger",
                    ].join(" ")}
                  >
                    Stok {number.format(selectedVariant.stockQuantity)}
                  </span>
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Pilih seluruh opsi untuk melihat kombinasi varian.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <section
        aria-labelledby="image-management-heading"
        className="rounded-3xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ProductIcon name="image" />
          </div>

          <div>
            <h2
              id="image-management-heading"
              className="text-lg font-semibold text-foreground"
            >
              Pengelolaan gambar
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Tambahkan foto dan atur urutan tampilannya di galeri.
            </p>
          </div>
        </div>

        {galleryNotice && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-success-soft p-3 text-sm text-success"
          >
            {galleryNotice}
          </p>
        )}

        {galleryError ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Muat ulang galeri sebelum mengelola gambar.
          </p>
        ) : (
          <>
            <details className="group mt-5 rounded-2xl border border-border bg-background/60">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-4 transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
                    <ProductIcon name="upload" />
                  </span>

                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      Upload gambar
                    </span>

                    <span className="mt-1 block text-xs text-muted">
                      JPG, PNG, atau WebP · Maksimal 5 MB
                    </span>
                  </span>
                </span>

                <span className="flex items-center gap-3">
                  <span className="hidden text-xs text-muted sm:block">
                    {gallery.length}/10 foto
                  </span>

                  <ProductIcon
                    name="down"
                    className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </span>
              </summary>

              <div className="border-t border-border px-4 pb-4">
                <ProductImageUpload
                  productId={product.id}
                  imageCount={gallery.length}
                  onUploaded={(image) => {
                    setGalleryNotice("Gambar berhasil ditambahkan.");
                    setSelectedImageId(image.id);
                    refresh();
                  }}
                />
              </div>
            </details>

            <ProductImageOrder
              key={gallery.map((image) => image.id).join(":")}
              productId={product.id}
              images={gallery}
              disabled={refreshing}
              onSaved={(firstImageId, message) => {
                setGalleryNotice(message);
                setSelectedImageId(firstImageId);
                refresh();
              }}
            />
          </>
        )}
      </section>

      {!galleryError && (
        <>
          <ProductOptionEditor
            productId={product.id}
            options={product.options}
          />

          <ProductOptionImages
            productId={product.id}
            options={options}
            images={gallery}
            disabled={refreshing}
            onSaved={(imageId, message) => {
              setGalleryNotice(message);

              if (imageId) {
                setSelectedImageId(imageId);
              }

              refresh();
            }}
          />
        </>
      )}

      <section
        id="product-variants"
        aria-labelledby="variants-heading"
        className="scroll-mt-6 overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
          <div>
            <h2
              id="variants-heading"
              className="text-lg font-semibold text-foreground"
            >
              Daftar varian
            </h2>
            <p className="mt-1 text-sm text-muted">
              Harga dan persediaan setiap kombinasi produk.
            </p>
          </div>

          <span className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted">
            {product.variants.length} varian
          </span>
        </div>

        {variantNotice && (
          <p
            role="status"
            className="mx-6 mt-4 rounded-xl bg-success-soft p-3 text-sm text-success"
          >
            {variantNotice}
          </p>
        )}

        {product.variants.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Belum ada varian produk.
          </p>
        ) : (
          <div
            role="region"
            aria-label="Tabel varian, dapat digulir horizontal"
            tabIndex={0}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="sr-only">
                Varian produk {product.title}
              </caption>

              <thead className="bg-background text-xs text-muted">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Kombinasi / SKU
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Penyesuaian harga
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Harga jual
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Stok
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right font-semibold"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {product.variants.map((variant) => (
                  <tr
                    key={variant.id}
                    className="transition-colors hover:bg-background/60"
                  >
                    <th
                      scope="row"
                      className="max-w-sm px-6 py-5 font-normal"
                    >
                      <p className="font-semibold text-foreground">
                        {variant.optionValueIds
                          .map((id) => valueLabels.get(id) ?? "Opsi")
                          .join(" · ") || "Varian standar"}
                      </p>

                      <p className="mt-2 break-all font-mono text-xs text-muted">
                        {variant.sku}
                      </p>
                    </th>

                    <td className="whitespace-nowrap px-6 py-5 text-muted">
                      {variant.priceAdjustment > 0 ? "+" : ""}
                      {currency.format(variant.priceAdjustment)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 font-semibold text-foreground">
                      {currency.format(variant.price)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={[
                          "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium",
                          variant.stockQuantity > 0
                            ? "bg-success-soft text-success"
                            : "bg-danger-soft text-danger",
                        ].join(" ")}
                      >
                        {number.format(variant.stockQuantity)} unit
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <ProductVariantEditor
                        key={`${variant.id}:${variant.stockQuantity}:${variant.priceAdjustment}`}
                        productId={product.id}
                        basePrice={product.basePrice}
                        variant={variant}
                        label={
                          variant.optionValueIds
                            .map((id) => valueLabels.get(id) ?? "Opsi")
                            .join(" · ") || "Varian standar"
                        }
                        disabled={refreshing}
                        onSaved={(message) => {
                          setVariantNotice(message);
                          refresh();
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}