import Link from "next/link";
import LogoutButton from "@/features/auth/LogoutButton";
import styles from "./addresses.module.css";

export default function AddressLoadError({ message, status, retryHref }: { message: string; status: number; retryHref: string }) {
  return <div className={styles.panel}>
    <h2>Alamat belum dapat dimuat</h2>
    <p className={styles.help} role="alert">{message}</p>
    <div className={styles.errorActions}>
      {status === 401 ? <LogoutButton /> : <a href={retryHref} className="action-button action-button--secondary">Coba kembali</a>}
      <Link href="/account" className="action-button action-button--outline">Kembali ke akun</Link>
    </div>
  </div>;
}
