import Link from "next/link";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import { checkoutHref, MAX_CHECKOUT_ITEMS } from "@/features/checkout/utils/selection";
import styles from "./cart.module.css";

type Props = { subtotal: number; quantity: number; itemIds: string[]; pending: boolean };

export default function CartSummary({ subtotal, quantity, itemIds, pending }: Props) {
  const allowed = !pending && itemIds.length > 0 && itemIds.length <= MAX_CHECKOUT_ITEMS;
  const hint = itemIds.length > MAX_CHECKOUT_ITEMS ? `Pilih maksimal ${MAX_CHECKOUT_ITEMS} varian untuk satu checkout.`
    : itemIds.length === 0 ? "Pilih minimal satu barang untuk melanjutkan." : "Harga dan stok diperiksa ulang di checkout.";

  function action(small = false) {
    return allowed
      ? <Link href={checkoutHref(itemIds)} prefetch={false}
        className={`action-button action-button--primary ${small ? "action-button--sm" : "w-full"}`}>
        <Icon name="arrow-right" />Lanjut ke checkout
      </Link>
      : <Button disabled className={small ? "" : "w-full"} size={small ? "sm" : "md"}
        icon={<Icon name="arrow-right" />}>Lanjut ke checkout</Button>;
  }
  return <>
    <aside className={styles.summary} aria-labelledby="cart-summary">
      <h2 id="cart-summary">Ringkasan belanja</h2>
      <dl>
        <div><dt>Barang dipilih</dt><dd>{formatNumber(quantity)} unit</dd></div>
        <div><dt>Subtotal produk</dt><dd>{formatCurrency(subtotal)}</dd></div>
        <div><dt>Ongkos kirim</dt><dd className={styles.shipping}>Belum dihitung</dd></div>
      </dl>
      <div className={styles.summaryTotal}><span>Subtotal pilihan</span><strong>{formatCurrency(subtotal)}</strong></div>
      <div className={styles.desktopCheckout}>{action()}</div>
      <p className={styles.checkoutHint}>{hint}</p>
    </aside>
    <div className={styles.checkoutBar} role="region" aria-label="Subtotal dan aksi belanja">
      <a href="#cart-summary" className={styles.checkoutAmount}><span>Subtotal · {formatNumber(quantity)} unit</span><strong>{formatCurrency(subtotal)}</strong><small>Lihat rincian ↑</small></a>
      <div className={styles.checkoutAction}>{action(true)}<span>{itemIds.length} varian dipilih</span></div>
    </div>
  </>;
}
