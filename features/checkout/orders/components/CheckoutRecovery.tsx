"use client";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useOrderSubmission } from "../useOrderSubmission";
import styles from "@/features/orders/components/orders.module.css";
export default function CheckoutRecovery({ customerId, contained=false }: { customerId: string; contained?:boolean }) {
  const order = useOrderSubmission(customerId);
  if (!order.intent) return null;
  const content = <aside className={styles.recovery} aria-label="Permintaan checkout sebelumnya">
    <div><strong>{order.intent.orderId ? "Pesanan terakhirmu" : "Ada permintaan checkout yang belum selesai"}</strong>
      <p>{order.intent.orderId ? "Buka pesanan untuk melihat statusnya." : "Periksa hasil permintaan sebelumnya sebelum membuat pesanan baru."}</p>
      {order.failure && <p role="alert">{order.failure.message}</p>}</div>
    {order.intent.orderId ? <Link className="action-button action-button--outline action-button--sm" href={`/orders/${order.intent.orderId}`}>Lihat pesanan</Link>
      : <Button size="sm" variant="secondary" loading={order.pending} onClick={() => order.submit()}>Periksa pesanan</Button>}
    {order.failure?.authRequired && <Link href="/auth">Masuk kembali</Link>}
  </aside>;
  return contained ? content : <div className={styles.recoveryContainer}>{content}</div>;
}
