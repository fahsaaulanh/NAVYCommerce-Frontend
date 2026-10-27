import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import CheckoutRecovery from "@/features/checkout/orders/components/CheckoutRecovery";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import styles from "@/features/account/components/account-layout.module.css";
export const metadata:Metadata = { title:"Pesanan | NAVYCommerce", robots:{index:false,follow:false} };
export default async function RecentOrderPage() {
  const user = await requireRole(["Customer"]);
  return <section><AccountPageHeader title="Pesanan" description="Buka pesanan terakhir di browser ini." />
    <div className={styles.stack}><CheckoutRecovery customerId={user.id} contained />
    <div className={styles.panel}><h2>Akses pesanan</h2><p>Simpan tautan detail pesanan untuk membukanya lagi di luar sesi browser ini.</p><Link href="/products" className="action-button action-button--outline mt-6">Kembali ke katalog</Link></div></div>
  </section>;
}
