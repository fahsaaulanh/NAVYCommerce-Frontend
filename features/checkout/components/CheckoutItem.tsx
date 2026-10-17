import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { CartItem } from "@/features/cart/types/cart";
import styles from "./checkout.module.css";

export default function CheckoutItem({ item }: { item: CartItem }) {
  return <article className={`${styles.item} ${!item.canCheckout ? styles.unavailableItem : ""}`} aria-label={item.productTitle}>
    <div className={styles.image}>{item.image
      ? <Image src={item.image.url} alt={item.image.altText || item.productTitle} fill unoptimized sizes="88px" className="object-cover" />
      : <Icon name="box" className="size-7" />}</div>
    <div className={styles.itemInfo}>
      <Link href={`/products/${item.productId}`} className={styles.itemTitle}>{item.productTitle}</Link>
      {item.options.length > 0 && <p className={styles.options}>{item.options.map(option => `${option.name}: ${option.value}`).join(" · ")}</p>}
      <p className={styles.unitPrice}>{formatCurrency(item.unitPrice)} <span>× {formatNumber(item.quantity)}</span></p>
      {!item.canCheckout && <p className={styles.itemWarning}>{item.availableStock < item.quantity
        ? `Stok tersedia ${formatNumber(item.availableStock)} unit. Sesuaikan jumlah di keranjang.`
        : "Produk ini belum dapat diproses. Periksa kembali di keranjang."}</p>}
    </div>
    <div className={styles.lineTotal}><small>Subtotal barang</small><strong>{formatCurrency(item.lineTotal)}</strong></div>
  </article>;
}
