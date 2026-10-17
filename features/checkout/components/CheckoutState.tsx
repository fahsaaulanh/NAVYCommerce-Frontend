import Link from "next/link";
import LogoutButton from "@/features/auth/LogoutButton";
import Icon from "@/components/ui/Icon";
import styles from "./checkout.module.css";

export default function CheckoutState({ title, message, status, retryHref }: { title: string; message: string; status?: number; retryHref?: string }) {
  return <div className={styles.page}><section className={styles.state}>
    <span className={styles.stateIcon}><Icon name="cart" className="size-8" /></span>
    <h1>{title}</h1><p role={status ? "alert" : undefined}>{message}</p>
    <div className={styles.stateActions}>
      {status === 401 ? <LogoutButton /> : retryHref && <a href={retryHref} className="action-button action-button--secondary">Coba kembali</a>}
      <Link href="/cart" className="action-button action-button--outline"><Icon name="arrow-left" />Kembali ke keranjang</Link>
    </div>
  </section></div>;
}
