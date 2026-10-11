"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import ProductIcon from "./ProductIcon";
import type { SellerProductSummary } from "./types";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("id-ID");

export default function SellerProductCard({
  product,
}: {
  product: SellerProductSummary;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const thumbnail = product.thumbnail;
  const canShowImage = thumbnail && failedUrl !== thumbnail.url;

  return (
    <Link
      href={`/seller/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-border bg-background">
        {canShowImage ? (
          <Image
            src={thumbnail.url}
            alt={thumbnail.altText || product.title}
            fill
            unoptimized
            sizes="(min-width: 1280px) 350px, (min-width: 768px) 50vw, 100vw"
            className="object-contain p-4 transition-transform duration-200 motion-safe:group-hover:scale-105"
            onError={() => setFailedUrl(thumbnail.url)}
          />
        ) : (
          <div className="text-center text-muted">
            <ProductIcon
              name="image"
              className="mx-auto size-10"
            />
            <p className="mt-3 text-xs">
              {thumbnail
                ? "Gambar belum tersedia"
                : "Belum ada gambar"}
            </p>
          </div>
        )}

        <span
          className={[
            "absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold",
            product.isActive
              ? "border-success/15 bg-success-soft text-success"
              : "border-border bg-surface text-muted",
          ].join(" ")}
        >
          {product.isActive ? "Aktif" : "Draft"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted">
          {product.categoryName || `Kategori #${product.categoryId}`}
        </p>

        <h2 className="mt-2 line-clamp-2 break-words text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {product.title}
        </h2>

        <div className="mt-4">
          <p className="text-xs text-muted">Harga dasar</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {currency.format(product.basePrice)}
          </p>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted">Total stok</dt>
            <dd
              className={[
                "mt-1 font-semibold",
                product.totalStock > 0
                  ? "text-foreground"
                  : "text-danger",
              ].join(" ")}
            >
              {number.format(product.totalStock)} unit
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted">Varian</dt>
            <dd className="mt-1 font-semibold text-foreground">
              {number.format(product.variantCount)} kombinasi
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-xs text-muted">
            {product.imageCount} foto
          </span>

          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Kelola produk
            <ProductIcon
              name="back"
              className="size-4 rotate-180"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}