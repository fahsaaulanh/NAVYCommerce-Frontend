"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/format";
import type { ProductVariant } from "@/features/products/types/types";
import { addCartItemAction } from "../actions/cart-actions";
import { isCartQuantity } from "../utils/validation";
import type { CartActionResult } from "../types/cart";
import QuantityControl from "./QuantityControl";
import styles from "./cart.module.css";

export default function AddToCartPanel({ variant }: { variant: ProductVariant | undefined }) {
  const [quantity, setQuantity] = useState("1");
  const [result, setResult] = useState<CartActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const amount = Number(quantity);
  const valid = isCartQuantity(amount) && !!variant && amount <= variant.stockQuantity;

  function add() {
    if (!variant || !valid) return;
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await addCartItemAction(variant.id, amount));
      } catch {
        setResult({ ok: false, message: "Hasil penambahan belum dapat dipastikan. Periksa keranjang sebelum mencoba kembali." });
      }
    });
  }

  return (
    <div className={styles.purchase}>
      <div className={styles.purchaseTop}>
        <div><p className={styles.label}>Jumlah pembelian</p>
          <QuantityControl value={quantity} max={variant?.stockQuantity ?? 0} label="Jumlah pembelian"
            disabled={pending || !variant || variant.stockQuantity < 1} onChange={(value) => { setQuantity(value); setResult(null); }} />
        </div>
        <div className={styles.purchaseTotal}><p className={styles.label}>Subtotal</p>
          <strong>{valid && variant ? formatCurrency(variant.price * amount) : "—"}</strong></div>
      </div>
      <Button className="w-full" icon={<Icon name="cart" />} loading={pending} disabled={!valid} onClick={add}>
        Tambah ke keranjang
      </Button>
      {!variant ? <p className={styles.hint}>Pilih seluruh opsi produk terlebih dahulu.</p>
        : variant.stockQuantity < 1 ? <p className={styles.hint}>Varian ini sedang habis.</p>
          : !valid ? <p role="alert" className={styles.hint}>Masukkan jumlah antara 1 dan {variant.stockQuantity}.</p> : null}
      {result && <div role={result.ok ? "status" : "alert"} className={result.ok ? styles.success : styles.notice}>
        <p>{result.message}</p>
        {result.ok ? <Link href="/cart">Lihat keranjang <span aria-hidden="true">→</span></Link>
          : result.authRequired ? <Link href="/auth">Masuk ke akun</Link> : <Link href="/cart">Periksa keranjang</Link>}
      </div>}
    </div>
  );
}
