import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import Icon from "@/components/ui/Icon";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import styles from "@/features/account/components/account.module.css";
export const metadata:Metadata = { title:"Akun saya | NAVYCommerce", robots:{index:false,follow:false} };
const roles = { Customer:"Pembeli", Seller:"Penjual", SuperAdmin:"Administrator" };
export default async function AccountPage() {
  const user = await requireUser();
  return <section>
    <AccountPageHeader title="Informasi akun" description="Informasi akun yang sedang kamu gunakan."
      action={user.role === "Seller" ? <Link href="/seller" className="action-button action-button--primary action-button--sm"><Icon name="store" />Seller Center<Icon name="arrow-right" /></Link> : undefined} />
    <div className={styles.panel}>
      <header className={styles.panelHeader}><Icon name="user" className="text-primary" /><div><h2>{user.fullName}</h2><p>{roles[user.role]}</p></div></header>
      <dl className={styles.details}>{[{label:"Nama lengkap",value:user.fullName},{label:"Email",value:user.email},{label:"Jenis akun",value:roles[user.role]}].map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
      <div className={styles.actions}><Link href="/products" className="action-button action-button--ghost">Kembali ke katalog</Link></div>
    </div>
    {user.role === "Customer" && <div className={styles.shortcuts}>
      <Link href="/account/addresses" className={styles.shortcut}><Icon name="store" /><div><h2>Alamat pengiriman</h2><p>Tambah alamat dan atur tujuan pengiriman utama.</p></div></Link>
      <Link href="/orders" className={styles.shortcut}><Icon name="box" /><div><h2>Pesanan</h2><p>Buka kembali pesanan terakhir dari sesi browser ini.</p></div></Link>
    </div>}
  </section>;
}
