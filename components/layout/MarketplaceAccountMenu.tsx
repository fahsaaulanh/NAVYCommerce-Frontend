"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Icon from "@/components/ui/Icon";
import LogoutButton from "@/features/auth/LogoutButton";
import type { SessionUser } from "@/lib/auth/session";
import styles from "./marketplace.module.css";

export default function MarketplaceAccountMenu({ user }: { user: SessionUser | null }) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function close(event: PointerEvent) {
      if (event.target instanceof Node && details.current && !details.current.contains(event.target)) details.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && details.current?.open) {
        details.current.open = false;
        details.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  if (!user) return <Link href="/auth" aria-label="Masuk / Daftar" className={styles.signIn}><Icon name="user" /><span>Masuk / Daftar</span></Link>;
  const close = () => { if (details.current) details.current.open = false; };
  return <details ref={details} className={styles.accountMenu}>
    <summary aria-label={`Menu akun ${user.fullName}`} className={styles.accountLink}>
      <span className={styles.accountIcon}><Icon name="user" /></span>
      <span className={styles.accountText}><small>Selamat datang</small>{user.fullName}</span>
      <Icon name="arrow-right" className={styles.accountChevron} />
    </summary>
    <div className={styles.accountDropdown}>
      <div className={styles.dropdownIdentity}><strong>{user.fullName}</strong><span>{user.email}</span></div>
      <Link href="/account" onClick={close}><Icon name="user" />Akun saya</Link>
      {user.role === "Customer" && <><Link href="/orders" onClick={close}><Icon name="box" />Pesanan terakhir</Link><Link href="/account/addresses" onClick={close}><Icon name="box" />Alamat pengiriman</Link><Link href="/cart" onClick={close}><Icon name="cart" />Keranjang belanja</Link></>}
      {user.role === "Seller" && <><Link href="/seller" onClick={close}><Icon name="grid" />Seller Center</Link><Link href="/seller/stores" onClick={close}><Icon name="store" />Toko saya</Link></>}
      <div className={styles.dropdownLogout}><LogoutButton /></div>
    </div>
  </details>;
}
