import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import styles from "./checkout.module.css";

type Props = { subtotal: number; quantity: number; storeCount: number; hasAddress: boolean; hasProblems: boolean };
export default function CheckoutSummary({ subtotal, quantity, storeCount, hasAddress, hasProblems }: Props) {
  const reason = hasProblems ? "Periksa barang yang perlu diperbaiki di keranjang."
    : !hasAddress ? "Lengkapi alamat pengiriman terlebih dahulu."
    : "Ongkir belum dapat dihitung. Pesanan belum dapat dilanjutkan.";
  return <>
    <aside className={styles.summary} aria-labelledby="checkout-summary">
      <h2 id="checkout-summary">Ringkasan belanja</h2>
      <dl>
        <div><dt>Barang tersedia</dt><dd>{formatNumber(quantity)} unit</dd></div>
        <div><dt>Toko</dt><dd>{formatNumber(storeCount)} toko</dd></div>
        <div><dt>Subtotal produk</dt><dd>{formatCurrency(subtotal)}</dd></div>
        <div><dt>Ongkos kirim</dt><dd className={styles.shippingUnknown}>Belum dihitung</dd></div>
      </dl>
      <div className={styles.summaryTotal}><span>Subtotal sementara</span><strong>{formatCurrency(subtotal)}</strong></div>
      <div className={styles.desktopAction}><Button disabled className="w-full" icon={<Icon name="arrow-right" />}>Buat pesanan</Button></div>
      <p className={styles.summaryReason}>{reason}</p>
    </aside>
    <div className={styles.mobileBar} role="region" aria-label="Subtotal dan aksi checkout">
      <a href="#checkout-summary"><span>Subtotal sementara</span><strong>{formatCurrency(subtotal)}</strong><small>Lihat rincian ↑</small></a>
      <Button disabled size="sm" icon={<Icon name="arrow-right" />}>Buat pesanan</Button>
    </div>
  </>;
}
