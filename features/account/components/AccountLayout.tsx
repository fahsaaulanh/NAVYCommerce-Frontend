import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/guards";
import LogoutButton from "@/features/auth/LogoutButton";
import AccountNavigation from "./AccountNavigation";
import styles from "./account-layout.module.css";
const labels = { Customer:"Pembeli", Seller:"Penjual", SuperAdmin:"Administrator" };
export default async function AccountLayout({ children }: { children:ReactNode }) {
  const user = await requireUser();
  return <div className={styles.page}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/account">Akun saya</Link></nav>
    <div className={styles.workspace}>
      <aside className={styles.sidebar} aria-label="Navigasi akun">
        <div className={styles.identity}><span className={styles.avatar} aria-hidden="true">{Array.from(user.fullName)[0]?.toUpperCase()}</span><div><strong title={user.fullName}>{user.fullName}</strong><span>{labels[user.role]}</span></div></div>
        <AccountNavigation role={user.role} />
        <div className={styles.logout}><LogoutButton /></div>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  </div>;
}
