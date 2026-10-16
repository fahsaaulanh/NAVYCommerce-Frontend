"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import AddToCartPanel from "@/features/cart/components/AddToCartPanel";
import ProductGallery from "../shared/ProductGallery";
import ProductIcon from "../shared/ProductIcon";
import styles from "./product-detail.module.css";
import { formatCurrency, formatNumber } from "@/lib/format";

import type { PublicProductDetailData } from "../../types/public-types";
import type { ProductOptionValue } from "../../types/types";

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
    <div className={styles.page}>
      <nav
        aria-label="Breadcrumb"
        className={styles.breadcrumb}
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
          className={styles.currentCrumb}
        >
          {product.title}
        </span>
      </nav>

      <div className={styles.productLayout}>
        <div className={styles.galleryColumn}>
          <ProductGallery
            title={product.title}
            images={images}
            selectedImageId={selectedImageId}
            onSelectImage={setSelectedImageId}
            onReload={refresh}
            refreshing={refreshing}
          />
          <p className={styles.galleryCaption}>
            Pilih foto untuk melihat detail produk dengan lebih jelas.
          </p>
        </div>

        <section
          aria-labelledby="product-title"
          className={styles.purchasePanel}
        >
          <p className={styles.category}>
            {categoryName || "Produk"}
          </p>

          <h1 id="product-title" className={styles.title}>
            {product.title}
          </h1>

          <div className={styles.pricePanel}>
            <p className={styles.priceLabel}>
              {selectedVariant
                ? "Harga varian terpilih"
                : minPrice !== maxPrice
                  ? "Rentang harga"
                  : "Harga produk"}
            </p>

            <p className={styles.price}>
              {selectedVariant
                ? formatCurrency(selectedVariant.price)
                : minPrice === maxPrice
                  ? formatCurrency(minPrice)
                  : `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`}
            </p>

            <p className={styles.priceHint}>
              {options.length > 0
                ? "Pilih kombinasi untuk melihat harga dan stok."
                : "Produk ini tersedia tanpa pilihan tambahan."}
            </p>
          </div>

          <div className={styles.variants}>
            <div className={styles.variantsHeading}>
              <h2 className={styles.sectionTitle}>
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

            <div className={styles.optionGroups}>
              {options.map((option) => (
                <fieldset key={option.id} className={styles.optionGroup}>
                  <legend className={styles.optionName}>
                    {option.name}
                  </legend>

                  <div className={styles.optionValues}>
                    {option.values.map((value) => {
                      const selected =
                        selection[option.id] === value.id;
                      const optionImage = value.imageId
                        ? images.find((image) => image.id === value.imageId)
                        : undefined;

                      return (
                        <button
                          key={value.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            selectOption(option.id, value)
                          }
                          className={`${styles.optionValue} ${selected
                              ? styles.optionValueSelected
                              : ""
                            }`}
                        >
                          {optionImage && (
                            <span className={styles.optionThumbnail}>
                              <Image
                                src={optionImage.url}
                                alt=""
                                fill
                                unoptimized
                                sizes="32px"
                              />
                            </span>
                          )}
                          <span className={styles.optionValueText}>
                            {value.value}
                          </span>

                          {selected && (
                            <ProductIcon
                              name="check"
                              className={styles.checkIcon}
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
              className={`${styles.stockNotice} ${selectedVariant?.stockQuantity ? styles.stockAvailable : ""} ${selectedVariant && selectedVariant.stockQuantity <= 0 ? styles.stockUnavailable : ""}`}
            >
              {selectedVariant ? (
                <>
                  <p className={styles.selectedCombination}>
                    {selectedLabels.join(" · ") || "Varian standar"}
                  </p>

                  <p
                    className={styles.stockText}
                  >
                    {selectedVariant.stockQuantity > 0
                      ? `Tersedia ${formatNumber(selectedVariant.stockQuantity)} unit`
                      : "Varian ini sedang habis."}
                  </p>
                </>
              ) : (
                <p className={styles.stockText}>
                  {!hasStock
                    ? "Stok seluruh varian sedang habis."
                    : selectedLabels.length === options.length
                      ? "Kombinasi ini tidak tersedia."
                      : "Pilih seluruh opsi untuk melihat ketersediaan kombinasi."}
                </p>
              )}
            </div>
          </div>

          <AddToCartPanel
            key={selectedVariant?.id ?? "choose-variant"}
            variant={selectedVariant}
          />

          <dl className={styles.specifications}>
            <div className={styles.specificationRow}>
              <dt>Berat produk</dt>
              <dd>{formatNumber(product.weightGrams)} gram</dd>
            </div>
          </dl>
        </section>
      </div>

      <section
        aria-labelledby="public-store-heading"
        className={styles.storeCard}
      >
        <div aria-hidden="true" className={styles.storeAvatar}>
          {Array.from(store.name)[0]?.toUpperCase() || "T"}
        </div>

        <div className={styles.storeDetails}>
          <p className={styles.storeEyebrow}>Toko penjual</p>

          <h2 id="public-store-heading" className={styles.storeName}>
            {store.name}
          </h2>
        </div>

        <span className={styles.storeSlug}>/{store.slug}</span>
      </section>

      <section
        aria-labelledby="public-description-heading"
        className={styles.descriptionCard}
      >
        <div className={styles.descriptionHeader}>
          <span className={styles.descriptionIcon} aria-hidden="true">
            <ProductIcon name="layers" />
          </span>
          <div>
            <p className={styles.descriptionEyebrow}>Detail produk</p>
            <h2 id="public-description-heading" className={styles.descriptionTitle}>
              Deskripsi produk
            </h2>
          </div>
        </div>

        <p className={styles.descriptionText}>
          {product.description?.trim() ||
            "Belum ada deskripsi produk."}
        </p>
      </section>
    </div>
  );
}
