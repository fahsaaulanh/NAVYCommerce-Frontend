import Link from "next/link";
import LogoutButton from "@/features/auth/LogoutButton";
import AccountPageHeader from "./AccountPageHeader";
import styles from "./account-layout.module.css";
export default function AccountPageState({ title, message, status, retryHref }: { title:string; message:string; status?:number; retryHref?:string }) {
  return <section><AccountPageHeader title={title} description={message} />
    <div className={styles.panel}><h2>{status === 404 ? "Periksa tautan pesanan" : "Coba kembali beberapa saat lagi"}</h2>
      <p role={status ? "alert" : undefined}>{status === 404 ? "Pastikan kamu masuk dengan akun yang membuat pesanan ini." : "Informasi pesanan belum bisa ditampilkan saat ini."}</p>
      <div className="mt-6 flex flex-wrap gap-3">{status === 401 ? <LogoutButton /> : retryHref && <a href={retryHref} className="action-button action-button--secondary">Coba kembali</a>}<Link href="/account" className="action-button action-button--outline">Informasi akun</Link></div>
    </div>
  </section>;
}
