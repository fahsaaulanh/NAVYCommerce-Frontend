"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import Icon from "@/components/ui/Icon";
import { formatNumber } from "@/lib/format";
import { removeCartItemAction, updateCartItemAction } from "../actions/cart-actions";
import type { Cart, CartActionResult, CartItem } from "../types/cart";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import styles from "./cart.module.css";

export default function CartView({ cart }: { cart: Cart }) {
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<CartActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const groups = new Map<string, { name: string; items: CartItem[] }>();
  for (const item of cart.items) {
    const group = groups.get(item.storeId) ?? { name: item.storeName, items: [] };
    group.items.push(item);
    groups.set(item.storeId, group);
  }
  const isSelected = (item: CartItem) => item.canCheckout && selection[item.id] !== false;
  const available = cart.items.filter((item) => item.canCheckout);
  const selected = cart.items.filter(isSelected);
  const allSelected = available.length > 0 && available.every(isSelected);
  const subtotal = selected.reduce((sum, item) => sum + item.lineTotal, 0);
  const quantity = selected.reduce((sum, item) => sum + item.quantity, 0);

  function toggleItems(items: CartItem[], checked: boolean) {
    setSelection((current) => {
      const next = { ...current };
      for (const item of items) if (item.canCheckout) next[item.id] = checked;
      return next;
    });
  }

  function mutate(operation: () => Promise<CartActionResult>) {
    setResult(null);
    startTransition(async () => {
      try { setResult(await operation()); }
      catch { setResult({ ok: false, message: "Hasil perubahan belum dapat dipastikan. Muat ulang keranjang sebelum mencoba kembali." }); }
    });
  }

  const feedback = result && (
    <div role={result.ok ? "status" : "alert"} className={result.ok ? styles.success : styles.notice}>
      <p>{result.message}</p>
      {!result.ok && result.authRequired
        ? <Link href="/auth">Masuk kembali</Link>
        : !result.ok ? <a href="/cart">Muat ulang keranjang</a> : null}
    </div>
  );

  return (
    <div className={styles.page} aria-busy={pending}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/products">Katalog produk</Link><span aria-hidden="true">/</span><span aria-current="page">Keranjang</span></nav>
      <header className={styles.heading}>
        <div><p className={styles.eyebrow}>BELANJA PILIHANMU</p><h1>Keranjang belanja</h1>
          <p>{cart.totalItems ? `${formatNumber(cart.totalItems)} varian produk dari ${formatNumber(groups.size)} toko` : "Simpan pilihan produkmu sebelum melanjutkan belanja."}</p></div>
        <Link href="/products" className="action-button action-button--outline action-button--sm"><Icon name="arrow-left" />Lanjut belanja</Link>
      </header>

      {cart.items.length === 0 && feedback}

      {cart.items.length === 0 ? <section className={styles.empty}>
        <span className={styles.emptyIcon}><Icon name="cart" className="size-10" /></span>
        <p className={styles.eyebrow}>MULAI DARI YANG KAMU SUKA</p><h2>Keranjangmu masih kosong</h2>
        <p>Temukan produk pilihan dari berbagai toko dan tambahkan varian yang kamu inginkan.</p>
        <Link href="/products" className="action-button action-button--primary"><Icon name="search" />Jelajahi produk</Link>
      </section> : <div className={styles.layout}>
        <div className={styles.itemsColumn} role="region" aria-label="Daftar barang dalam keranjang" tabIndex={0}>
          {feedback}
          <div className={styles.toolbar}><label><input type="checkbox" className={styles.checkbox} checked={allSelected} disabled={pending || available.length === 0} onChange={(event) => toggleItems(available, event.target.checked)} />Pilih semua <span>({available.length})</span></label>
            <span>{selected.length} varian dipilih</span></div>
          {[...groups].map(([storeId, group]) => {
            const eligible = group.items.filter((item) => item.canCheckout);
            return <section key={storeId} className={styles.storeGroup} aria-label={`Produk dari ${group.name}`}>
              <header className={styles.storeHeader}>
                <input type="checkbox" className={styles.checkbox} aria-label={`Pilih semua produk ${group.name}`} checked={eligible.length > 0 && eligible.every(isSelected)} disabled={pending || eligible.length === 0} onChange={(event) => toggleItems(eligible, event.target.checked)} />
                <span className={styles.storeIcon}><Icon name="store" /></span><h2>{group.name}</h2><span className={styles.storeCount}>{group.items.length} varian</span>
              </header>
              {group.items.map((item) => <CartItemRow key={`${item.id}:${item.quantity}:${item.availableStock}`} item={item} selected={isSelected(item)} pending={pending}
                onSelect={() => toggleItems([item], !isSelected(item))}
                onUpdate={(value) => mutate(() => updateCartItemAction(item.id, value))}
                onRemove={() => mutate(() => removeCartItemAction(item.id))} />)}
            </section>;
          })}
          <p className={styles.footnote}>Menambahkan produk ke keranjang belum memesan stok. Harga dan ketersediaan dapat berubah.</p>
        </div>
        <CartSummary subtotal={subtotal} quantity={quantity} />
      </div>}
    </div>
  );
}
