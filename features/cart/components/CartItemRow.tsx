"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import { isCartQuantity } from "../utils/validation";
import type { CartItem } from "../types/cart";
import QuantityControl from "./QuantityControl";
import styles from "./cart.module.css";

type Props = {
  item: CartItem;
  selected: boolean;
  pending: boolean;
  onSelect: () => void;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
};

export default function CartItemRow({ item, selected, pending, onSelect, onUpdate, onRemove }: Props) {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const number = Number(quantity);
  const valid = isCartQuantity(number) && number <= item.availableStock;

  return (
    <article className={`${styles.item} ${!item.canCheckout ? styles.itemUnavailable : ""}`} aria-label={item.productTitle}>
      <input type="checkbox" className={styles.checkbox} checked={selected} disabled={pending || !item.canCheckout}
        aria-label={`Pilih ${item.productTitle}, ${item.options.map((option) => option.value).join(", ") || "varian standar"}`} onChange={onSelect} />
      <Link href={`/products/${item.productId}`} className={styles.image} aria-label={`Lihat ${item.productTitle}`}>
        {item.image ? <Image src={item.image.url} alt={item.image.altText || item.productTitle} fill unoptimized sizes="(max-width: 600px) 80px, 112px" />
          : <Icon name="box" className="size-8" />}
      </Link>
      <div className={styles.itemDetails}>
        <Link href={`/products/${item.productId}`} className={styles.itemTitle}>{item.productTitle}</Link>
        <div className={styles.options}>{item.options.length ? item.options.map((option) => <span key={option.name}>{option.name}: {option.value}</span>) : <span>Varian standar</span>}</div>
        <p className={styles.itemPrice}>{formatCurrency(item.unitPrice)} <small>/ unit</small></p>
        {!item.canCheckout && <p className={styles.unavailableText}>
          {item.availableStock < item.quantity ? `Stok tersedia ${formatNumber(item.availableStock)} unit. Sesuaikan jumlah pembelian.` : "Produk sedang tidak tersedia untuk dibeli."}
        </p>}
        <form className={styles.itemActions} onSubmit={(event) => { event.preventDefault(); if (valid && number !== item.quantity) onUpdate(number); }}>
          <QuantityControl value={quantity} max={item.availableStock} label={`Jumlah ${item.productTitle}`}
            disabled={pending || item.availableStock < 1} onChange={setQuantity} />
          {quantity !== String(item.quantity) && <Button type="submit" size="sm" variant="secondary" disabled={pending || !valid}>Simpan</Button>}
          <Button variant="ghost" size="sm" disabled={pending} icon={<Icon name="trash" />} onClick={onRemove} aria-label={`Hapus ${item.productTitle} dari keranjang`}>Hapus</Button>
        </form>
        {quantity !== String(item.quantity) && !valid && <p className={styles.unavailableText}>Jumlah harus antara 1 dan {item.availableStock}.</p>}
      </div>
      <div className={styles.lineTotal}><small>Total produk</small><strong>{formatCurrency(item.lineTotal)}</strong></div>
    </article>
  );
}
