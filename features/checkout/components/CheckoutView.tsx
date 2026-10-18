"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { useCheckoutShipping } from "../shipping/useCheckoutShipping";
import ShippingOptions from "../shipping/components/ShippingOptions";
import { formatNumber } from "@/lib/format";
import { groupCartItems } from "@/features/cart/utils/group-items";
import type { CheckoutPreview } from "../types/checkout";
import { checkoutHref } from "../utils/selection";
import CheckoutAddress from "./CheckoutAddress";
import CheckoutItem from "./CheckoutItem";
import CheckoutSummary from "./CheckoutSummary";
import styles from "./checkout.module.css";

type Props = { preview: CheckoutPreview; initialAddressId: string | null; invalidAddress: boolean };
export default function CheckoutView(props: Props) {
  const key = JSON.stringify([props.initialAddressId, props.preview.selectedIds,
    props.preview.missingCount, props.preview.addressError,
    props.preview.items.map(i => [i.id, i.quantity, i.unitPrice, i.lineTotal, i.canCheckout, i.availableStock]),
    props.preview.addresses.map(a => [a.id, a.updatedAt, a.villageCode, a.postalCode])]);
  return <CheckoutWorkspace key={key} {...props} />;
}

function CheckoutWorkspace({ preview, initialAddressId, invalidAddress }: Props) {
  const [selection, setSelection] = useState({ id: initialAddressId, revision: 0 });
  const addressId = selection.id;
  const shipping = useCheckoutShipping(JSON.stringify([addressId, selection.revision]), addressId, preview.items);
  const groups = groupCartItems(preview.items);
  const eligible = preview.items.filter(item => item.canCheckout);
  const availableGroups = groupCartItems(eligible);
  const subtotal = eligible.reduce((total, item) => total + item.lineTotal, 0);
  const quantity = eligible.reduce((total, item) => total + item.quantity, 0);
  const unavailable = preview.items.length - eligible.length;
  const hasProblems = preview.missingCount > 0 || unavailable > 0;
  const hasAddress = preview.addresses.some(address => address.id === addressId);
  const currentUrl = checkoutHref(preview.selectedIds, addressId);

  return <div className={styles.page}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/cart">Keranjang</Link><span aria-hidden="true">/</span><span aria-current="page">Checkout</span></nav>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}>TINJAU BELANJAMU</p><h1>Checkout</h1><p>{formatNumber(preview.selectedIds.length)} varian dipilih · {formatNumber(groups.size)} toko</p></div>
      <div className={styles.headerActions}><a href={currentUrl} className="action-button action-button--outline action-button--sm">Perbarui data</a>
        <Link href="/cart" className="action-button action-button--ghost action-button--sm"><Icon name="arrow-left" />Ubah keranjang</Link></div>
    </header>
    <div className={styles.layout}>
      <div className={styles.contentColumn} role="region" aria-label="Detail checkout" tabIndex={0}>
        {preview.missingCount > 0 && <div className={styles.problem} role="alert"><strong>{preview.missingCount} barang tidak lagi tersedia di keranjang ini.</strong><p>Kembali ke keranjang untuk memperbarui pilihan barang.</p><Link href="/cart">Periksa keranjang</Link></div>}
        {unavailable > 0 && <div className={styles.problem} role="alert"><strong>Ada {unavailable} varian yang perlu diperbaiki.</strong><p>Harga, stok, atau status produk berubah. Barang tersebut tidak disertakan dalam subtotal barang tersedia.</p><Link href="/cart">Periksa keranjang</Link></div>}
        {invalidAddress && !hasAddress && <div className={styles.problem} role="alert">Alamat yang diminta tidak tersedia untuk akunmu. Pilih kembali alamat pengiriman.</div>}
        <CheckoutAddress addresses={preview.addresses} selectedId={addressId} error={preview.addressError} checkoutUrl={currentUrl}
          onSelect={id => {
            if (!preview.addresses.some(address => address.id === id)) return;
            if (id === addressId) return;
            setSelection(previous => ({ id, revision: previous.revision + 1 }));
            window.history.replaceState(null, "", checkoutHref(preview.selectedIds, id));
          }} />
        <section className={styles.shippingControls} aria-labelledby="shipping-heading">
          <div><h2 id="shipping-heading">Pilihan pengiriman</h2><p>{hasProblems ? "Perbaiki barang di keranjang terlebih dahulu."
            : !hasAddress ? "Pilih alamat pengiriman terlebih dahulu."
            : "Hitung ongkir lalu pilih satu layanan untuk setiap toko."}</p></div>
          <Button variant="secondary" size="sm" loading={shipping.pending} disabled={!hasAddress || hasProblems}
            onClick={shipping.calculate} icon={<Icon name="box" />}>{shipping.quote ? "Hitung ulang ongkir" : "Hitung ongkir"}</Button>
        </section>
        {shipping.failure && <div className={styles.problem} role="alert"><p>{shipping.failure.message}</p>
          {shipping.failure.authRequired && <Link href="/auth">Masuk kembali</Link>}
          {shipping.failure.refreshRequired && <a href={currentUrl}>Perbarui data checkout</a>}
        </div>}
        <div className={styles.itemsHeading}><h2>Barang pesanan</h2><span>{preview.items.length} varian ditemukan</span></div>
        {[...groups].map(([storeId, group]) => <section className={styles.storeGroup} key={storeId} aria-label={`Pesanan dari ${group.name}`}>
          <header className={styles.storeHeader}><span className={styles.panelIcon}><Icon name="store" /></span><h3>{group.name}</h3><span>{group.items.length} varian</span></header>
          {group.items.map(item => <CheckoutItem key={item.id} item={item} />)}
          <ShippingOptions storeId={storeId} storeName={group.name}
            quote={shipping.quote?.packages.find(p => p.storeId === storeId)}
            selected={shipping.choices[storeId]} pending={shipping.pending} hasAddress={hasAddress} blocked={hasProblems}
            onSelect={key => shipping.choose(storeId, key)} />
        </section>)}
        {preview.items.length === 0 && <div className={styles.panel}><h2>Tidak ada barang yang dapat ditampilkan</h2><p className={styles.help}>Pilih kembali barang dari keranjang milikmu.</p><Link href="/cart" className={styles.textLink}>Kembali ke keranjang</Link></div>}
        <p className={styles.footnote}>Harga dan ketersediaan dibaca ulang saat halaman ini dimuat. Barang di keranjang belum memesan stok.</p>
      </div>
      <CheckoutSummary subtotal={subtotal} quantity={quantity} storeCount={availableGroups.size} hasAddress={hasAddress} hasProblems={hasProblems}
        shippingCost={shipping.cost} shippingComplete={shipping.complete} shippingCount={shipping.selectedCount}
        hasQuote={!!shipping.quote} pending={shipping.pending} />
    </div>
  </div>;
}
