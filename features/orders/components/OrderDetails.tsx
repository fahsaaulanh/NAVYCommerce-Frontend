"use client";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import RefreshButton from "@/components/ui/RefreshButton";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/format";
import { cancelOrderAction } from "@/features/checkout/orders/actions/order-actions";
import type { OrderReceipt } from "../types/order";
import styles from "./orders.module.css";
const date = (value: string) => new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta",
}).format(new Date(value));
const statuses = {
  Pending: { label: "Menunggu pembayaran", description: "Pesanan sudah tercatat dan stok ditahan sementara. Pembayaran belum tersedia pada demo ini." },
  Paid: { label: "Sudah dibayar", description: "Pembayaran pesanan telah tercatat." },
  Cancelled: { label: "Dibatalkan", description: "Pesanan ditutup. Stok yang sebelumnya ditahan sudah dilepas." },
  Expired: { label: "Kedaluwarsa", description: "Batas waktu pesanan telah lewat. Stok yang sebelumnya ditahan sudah dilepas." },
};
const storeLabels: Record<string, string> = {
  AwaitingPayment: "Menunggu pembayaran", Processing: "Diproses", Shipped: "Dikirim",
  Completed: "Selesai", Cancelled: "Dibatalkan", Expired: "Kedaluwarsa",
};
export default function OrderDetails({ receipt }: { receipt: OrderReceipt }) {
  const router = useRouter();
  const [order, setOrder] = useState(receipt);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = useRef(false);
  const status = statuses[order.paymentStatus];
  function cancel() {
    if (busy.current) return;
    busy.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const result = await cancelOrderAction(order.id);
        if (result.ok) { setOrder(result.data); setConfirmOpen(false); router.refresh(); }
        else setError(result.message);
      } catch { setError("Status pembatalan belum dapat dipastikan. Perbarui halaman sebelum mencoba kembali."); }
      finally { busy.current = false; }
    });
  }
  return <section className={styles.page}>
    <AccountPageHeader title="Ringkasan pesanan" description={`Dibuat ${date(order.createdAt)} WIB`}
      action={<RefreshButton label="Perbarui status" />} />
    <div className={styles.layout}>
      <div className={styles.main}>
        <section className={styles.statusPanel} aria-labelledby="order-status">
          <span className={styles.statusIcon}><Icon name={order.paymentStatus === "Paid" ? "check" : order.paymentStatus === "Pending" ? "clock" : "box"} /></span>
          <div><span className={styles.badge}>{status.label}</span><h2 id="order-status">{order.paymentStatus === "Pending" ? "Pesanan berhasil dibuat" : status.label}</h2><p>{status.description}</p>
          {order.paymentStatus === "Pending" && <p className={styles.deadline}><Icon name="clock" />Batas waktu: <time dateTime={order.expiresAt}>{date(order.expiresAt)} WIB</time></p>}</div>
        </section>
        <div className={styles.reference}><span>Nomor pesanan</span><code>{order.id}</code></div>
        <section className={styles.panel} aria-labelledby="order-stores"><div className={styles.panelHeading}><h2 id="order-stores">Pesanan per toko</h2><span>{order.storeOrders.length} toko</span></div>
          {order.storeOrders.map(store => <article key={store.id} className={styles.store}><div className={styles.storeTitle}><span className={styles.storeIcon}><Icon name="store" /></span><div><h3>{store.storeName}</h3><p>{storeLabels[store.status] ?? store.status}</p></div></div>
            <dl><div><dt>Subtotal produk</dt><dd>{formatCurrency(store.itemsSubtotal)}</dd></div><div><dt>Ongkos kirim</dt><dd>{formatCurrency(store.shippingCost)}</dd></div><div className={styles.storeTotal}><dt>Total toko</dt><dd>{formatCurrency(store.grandTotal)}</dd></div></dl></article>)}
        </section>
        <div className={styles.actions}><Link href="/products" className="action-button action-button--secondary"><Icon name="grid" />Lanjut belanja</Link><Link href="/cart" className="action-button action-button--ghost">Kembali ke keranjang</Link></div>
      </div>
      <aside className={`${styles.panel} ${styles.summary}`} aria-labelledby="order-total"><h2 id="order-total">Ringkasan biaya</h2><dl><div><dt>Subtotal produk</dt><dd>{formatCurrency(order.itemsSubtotal)}</dd></div><div><dt>Ongkos kirim</dt><dd>{formatCurrency(order.shippingTotal)}</dd></div></dl><div className={styles.total}><span>Total pesanan</span><strong>{formatCurrency(order.grandTotal)}</strong></div>
        {order.paymentStatus === "Pending" && <><p className={styles.note}>Ini adalah demo portofolio. Tidak ada pembayaran atau pengiriman barang sungguhan.</p><Button variant="outline" className="w-full" onClick={() => setConfirmOpen(true)} icon={<Icon name="close" />}>Batalkan pesanan</Button></>}
      </aside>
    </div>
    <ConfirmDialog open={confirmOpen} title="Batalkan pesanan ini?"
      description="Seluruh pesanan dari toko-toko di atas akan dibatalkan. Barang tidak otomatis dikembalikan ke keranjang."
      confirmLabel="Ya, batalkan" cancelLabel="Kembali" pending={pending} error={error ?? undefined}
      onConfirm={cancel} onClose={() => { setConfirmOpen(false); setError(null); }} />
  </section>;
}
