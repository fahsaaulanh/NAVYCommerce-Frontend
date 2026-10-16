import Link from "next/link";
import { formatNumber } from "@/lib/format";
import Icon from "@/components/ui/Icon";
import type { SessionUser } from "@/lib/auth/session";
import styles from "./cart-link.module.css";

type Props = {
  role: SessionUser["role"] | null;
  quantity: number | null;
};

export default function CartLink({ role, quantity }: Props) {
  if (role && role !== "Customer") return null;

  const count = role === "Customer" ? quantity : null;
  const label = count === null
    ? "Keranjang belanja"
    : `Keranjang belanja, ${formatNumber(count)} barang`;

  return (
    <Link href={role ? "/cart" : "/auth"} className={styles.link} aria-label={label} title={label}>
      <Icon name="cart" />
      {count !== null && count > 0 && (
        <span className={styles.badge} aria-hidden="true">{count > 99 ? "99+" : count}</span>
      )}
    </Link>
  );
}
