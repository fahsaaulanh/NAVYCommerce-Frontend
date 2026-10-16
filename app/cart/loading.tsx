import styles from "@/features/cart/components/cart.module.css";

export default function Loading() {
  return <div className={styles.page} role="status" aria-label="Memuat keranjang">
    <div className="my-8 h-12 w-56 rounded-xl bg-border" />
    <div className={styles.layout}><div className={styles.itemsColumn}><div className={styles.skeleton} /><div className={styles.skeleton} /></div><div className={styles.skeleton} /></div>
    <span className="sr-only">Memuat keranjang belanja…</span>
  </div>;
}
