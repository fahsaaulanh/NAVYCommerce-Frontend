"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import type { SessionUser } from "@/lib/auth/session";
import styles from "./account-layout.module.css";
const buyerMenu = [
  { href:"/account", label:"Informasi akun", icon:"user" },
  { href:"/account/addresses", label:"Alamat pengiriman", icon:"store" },
  { href:"/orders", label:"Pesanan", icon:"box" },
] as const;
export default function AccountNavigation({ role }: { role:SessionUser["role"] }) {
  const pathname = usePathname();
  const menu = role === "Customer" ? buyerMenu : [buyerMenu[0]];
  return <nav aria-label="Menu akun" className={`${styles.menu} ${role !== "Customer" ? styles.singleMenu : ""}`}>
    {menu.map(item => {
      const active = item.href === "/account" ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
        <Icon name={item.icon} /><span>{item.label}</span>
      </Link>;
    })}
  </nav>;
}
