import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import AddressSymbol from "./AddressSymbol";
import styles from "./addresses.module.css";

type Props = { title: string; description: string; action?: ReactNode; children: ReactNode; form?: boolean };
export default function AddressPageShell({ title, description, action, children, form = false }: Props) {
  return <div className={styles.page}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <Link href="/account">Akun saya</Link><span aria-hidden="true">/</span>
      {form ? <><Link href="/account/addresses">Alamat pengiriman</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></>
        : <span aria-current="page">Alamat pengiriman</span>}
    </nav>
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarTitle}>Akun saya</p>
        <nav aria-label="Menu akun">
          <Link href="/account"><Icon name="user" />Profil akun</Link>
          <Link href="/account/addresses" aria-current={form ? "location" : "page"} className={styles.activeNav}><AddressSymbol name="pin" />Alamat pengiriman</Link>
        </nav>
        <div className={styles.sidebarHint}><span className={styles.smallDot} />Alamat ini digunakan saat kamu berbelanja.</div>
      </aside>
      <section className={styles.content} aria-labelledby="addresses-title">
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>Pengaturan akun</p><h1 id="addresses-title">{title}</h1><p>{description}</p></div>
          {action}
        </header>
        {children}
      </section>
    </div>
  </div>;
}
