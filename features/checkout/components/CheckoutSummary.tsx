import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import styles from "./checkout.module.css";

type Props = {
  subtotal: number; quantity: number; storeCount: number; hasAddress: boolean; hasProblems: boolean;
  shippingCost: number; shippingComplete: boolean; shippingCount: number; hasQuote: boolean; pending: boolean; submitting: boolean; unresolved: boolean; onSubmit: () => void;
};
export default function CheckoutSummary({ subtotal, quantity, storeCount, hasAddress, hasProblems,
  shippingCost, shippingComplete, shippingCount, hasQuote, pending, submitting, unresolved, onSubmit }: Props) {
  const reason = hasProblems ? "Periksa barang yang perlu diperbaiki di keranjang."
    : !hasAddress ? "Lengkapi alamat pengiriman terlebih dahulu."
    : pending ? "Sedang menghitung pilihan ongkir."
    : !hasQuote ? "Hitung ongkir untuk melihat pilihan pengiriman."
    : !shippingComplete ? "Lengkapi pilihan layanan pengiriman untuk setiap toko."
    : "Dengan membuat pesanan, stok ditahan sementara. Pembayaran belum tersedia pada demo ini.";
  const disabled = !unresolved && (hasProblems || !hasAddress || !shippingComplete || pending || quantity < 1);
  const total = subtotal + (shippingComplete ? shippingCost : 0);
  const totalLabel = shippingComplete ? "Total belanja" : "Subtotal produk";
  return <>
    <aside className={styles.summary} aria-labelledby="checkout-summary">
      <h2 id="checkout-summary">Ringkasan belanja</h2>
      <dl>
        <div><dt>Barang tersedia</dt><dd>{formatNumber(quantity)} unit</dd></div>
        <div><dt>Toko</dt><dd>{formatNumber(storeCount)} toko</dd></div>
        <div><dt>Subtotal produk</dt><dd>{formatCurrency(subtotal)}</dd></div>
        <div><dt>Ongkos kirim</dt><dd className={shippingComplete ? undefined : styles.shippingUnknown}>
          {shippingCount > 0 ? formatCurrency(shippingCost) : "Belum dipilih"}
          {shippingCount > 0 && !shippingComplete && <small className={styles.partialShipping}>{shippingCount} dari {storeCount} toko</small>}
        </dd></div>
      </dl>
      <div className={styles.summaryTotal}><span>{totalLabel}</span><strong>{formatCurrency(total)}</strong></div>
      <div className={styles.desktopAction}><Button disabled={disabled} loading={submitting} onClick={onSubmit} className="w-full" icon={<Icon name="arrow-right" />}>{unresolved ? "Periksa pesanan" : "Buat pesanan"}</Button></div>
      <p className={styles.summaryReason}>{reason}</p>
    </aside>
    <div className={styles.mobileBar} role="region" aria-label="Total dan aksi checkout">
      <a href="#checkout-summary"><span>{totalLabel}</span><strong>{formatCurrency(total)}</strong><small>Lihat rincian ↑</small></a>
      <Button disabled={disabled} loading={submitting} onClick={onSubmit} size="sm" icon={<Icon name="arrow-right" />}>{unresolved ? "Periksa pesanan" : "Buat pesanan"}</Button>
    </div>
  </>;
}
