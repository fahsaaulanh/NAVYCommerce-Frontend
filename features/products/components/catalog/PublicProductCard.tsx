"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/format";
import type { PublicProductSummary } from "../../types/public-types";
import styles from "./catalog.module.css";
export default function PublicProductCard({
  product,
  headingLevel = 2,
}: {
  product: PublicProductSummary;
  headingLevel?: 2 | 3;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const photo = product.thumbnail;
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <Link
      href={`/products/${encodeURIComponent(product.id)}`}
      className={styles.cardLink}
    >
      <article className={styles.card}>
        <div className={styles.cardImage}>
          {photo && failedUrl !== photo.url ? (
            <Image
              src={photo.url}
              alt={photo.altText || product.title}
              fill
              unoptimized
              sizes="(min-width: 1200px) 270px, (min-width: 768px) 28vw, 50vw"
              className="object-contain p-3"
              onError={() => setFailedUrl(photo.url)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
              <Icon name="box" className="size-8" />
              <span className="text-xs">Foto belum tersedia</span>
            </div>
          )}
          {!product.hasStock && (
            <span className={styles.stockBadge}>Stok habis</span>
          )}
        </div>
        <div className={styles.cardBody}>
          <p className={styles.cardCategory}>
            {product.categoryName || "Produk"}
          </p>
          <Heading className={styles.cardTitle}>{product.title}</Heading>
          <p className={styles.cardPrice}>{formatCurrency(product.minPrice)}</p>
          <p className={styles.cardRange}>
            {product.minPrice !== product.maxPrice
              ? `Hingga ${formatCurrency(product.maxPrice)}`
              : product.hasStock ? "Stok tersedia" : "Stok habis"}
          </p>
          <div className={styles.cardStore}>
            <Icon name="store" className="size-3.5" />
            <span>{product.storeName}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
