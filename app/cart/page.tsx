import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import LogoutButton from "@/features/auth/LogoutButton";
import { cartApi } from "@/features/cart/api/cart-api";
import CartView from "@/features/cart/components/CartView";
import styles from "@/features/cart/components/cart.module.css";

export const metadata: Metadata = { title: "Keranjang Belanja | NAVYCommerce" };

export default async function CartPage() {
  await requireRole(["Customer"]);
  const loaded = await cartApi.getMine().then(response => ({ response,error:null }))
    .catch((error: unknown) => {
      if (!(error instanceof BackendApiError)) throw error;
      return { response:null,error };
    });
  if (loaded.response) return <CartView cart={loaded.response.data} />;
  const error = loaded.error!;
  return <div className={styles.page}><section className={styles.errorBox}>
    <h1>Keranjang belum dapat dimuat</h1><p role="alert">{error.message}</p>
    <div className={styles.errorActions}>
      {error.status === 401 ? <LogoutButton /> : <a href="/cart" className="action-button action-button--primary">Coba kembali</a>}
      <Link href="/products" className="action-button action-button--outline">Kembali ke katalog</Link>
    </div>
  </section></div>;
}
