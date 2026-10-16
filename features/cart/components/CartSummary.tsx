import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import styles from "./cart.module.css";

type Props = { subtotal: number; quantity: number };

export default function CartSummary({ subtotal, quantity }: Props) {
  return (
    <>
      <aside className={styles.summary} aria-labelledby="cart-summary">
        <h2 id="cart-summary">Ringkasan belanja</h2>
        <dl>
          <div><dt>Barang dipilih</dt><dd>{formatNumber(quantity)} unit</dd></div>
          <div><dt>Subtotal produk</dt><dd>{formatCurrency(subtotal)}</dd></div>
          <div><dt>Ongkos kirim</dt><dd className={styles.shipping}>Belum dihitung</dd></div>
        </dl>
        <div className={styles.summaryTotal}>
          <span>Subtotal pilihan</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className={styles.desktopCheckout}>
          <Button className="w-full" disabled icon={<Icon name="arrow-right" />}>Lanjut ke checkout</Button>
        </div>
        <p className={styles.checkoutHint}>Checkout belum tersedia.</p>
      </aside>

      <div className={styles.checkoutBar} role="region" aria-label="Subtotal dan aksi belanja">
        <a href="#cart-summary" className={styles.checkoutAmount}>
          <span>Subtotal · {formatNumber(quantity)} unit</span>
          <strong>{formatCurrency(subtotal)}</strong>
          <small>Lihat rincian ↑</small>
        </a>
        <div className={styles.checkoutAction}>
          <Button disabled size="sm" icon={<Icon name="arrow-right" />}>Lanjut ke checkout</Button>
          <span>Checkout belum tersedia</span>
        </div>
      </div>
    </>
  );
}
