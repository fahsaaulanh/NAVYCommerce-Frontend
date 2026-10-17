"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import AddressDetails from "@/features/addresses/components/AddressDetails";
import AddressSymbol from "@/features/addresses/components/AddressSymbol";
import type { CustomerAddress } from "@/features/addresses/types/address";
import styles from "./checkout.module.css";

type Props = {
  addresses: CustomerAddress[];
  selectedId: string | null;
  error: { status: number; message: string } | null;
  checkoutUrl: string;
  onSelect: (id: string) => void;
};

export default function CheckoutAddress({ addresses, selectedId, error, checkoutUrl, onSelect }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const titleId = useId();
  const selected = addresses.find(address => address.id === selectedId);
  const createHref = `/account/addresses/new?${new URLSearchParams({ returnTo: checkoutUrl })}`;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open) {
      if (!element.open) element.showModal();
      const oldOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = oldOverflow; };
    }
    if (element.open) element.close();
  }, [open]);

  return <section className={styles.panel} aria-labelledby="checkout-address-title">
    <div className={styles.panelHeader}>
      <span className={styles.panelIcon}><AddressSymbol name="pin" /></span>
      <h2 id="checkout-address-title">Alamat pengiriman</h2>
      {!error && addresses.length > 0 && <Button variant="outline" size="sm" aria-haspopup="dialog"
        onClick={() => { setDraftId(selectedId); setOpen(true); }}>{selected ? "Ganti alamat" : "Pilih alamat"}</Button>}
    </div>
    {error ? <div className={styles.addressEmpty}>
      <p role="alert">{error.message}</p>
      {error.status === 401 ? <Link href="/auth" className="action-button action-button--secondary action-button--sm">Masuk kembali</Link>
        : <a href={checkoutUrl} className="action-button action-button--secondary action-button--sm">Muat ulang alamat</a>}
    </div> : selected ? <div className={styles.addressBody}>
      <div className={styles.addressLabel}><strong>{selected.label}</strong>{selected.isDefault && <span>Utama</span>}</div>
      <AddressDetails address={selected} />
      <Link href={`/account/addresses/${selected.id}/edit?${new URLSearchParams({ returnTo: checkoutUrl })}`}
        className={styles.textLink}><AddressSymbol name="edit" />Ubah detail alamat</Link>
    </div> : <div className={styles.addressEmpty}>
      <h3>{addresses.length ? "Pilih tujuan pengiriman" : "Belum ada alamat pengiriman"}</h3>
      <p>{addresses.length ? "Alamat yang dipilih belum tersedia. Pilih alamat milikmu untuk pesanan ini." : "Tambahkan alamat penerima untuk melengkapi informasi pengiriman."}</p>
      <Link href={createHref} className="action-button action-button--secondary action-button--sm"><Icon name="plus" />Tambah alamat</Link>
    </div>}
    <dialog ref={dialog} className={styles.addressDialog} aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); setOpen(false); }}>
      {open && <>
      <div className={styles.dialogHeader}><div><h2 id={titleId}>Pilih alamat pengiriman</h2><p>Pilihan ini hanya berlaku untuk checkout ini.</p></div>
        <Button variant="ghost" size="icon" aria-label="Tutup pilihan alamat" icon={<Icon name="close" />} onClick={() => setOpen(false)}>Tutup</Button>
      </div>
      <fieldset className={styles.addressOptions}><legend className="sr-only">Alamat tujuan pesanan</legend>
        {addresses.map(address => <label key={address.id} className={`${styles.addressOption} ${draftId === address.id ? styles.chosenOption : ""}`}>
          <input type="radio" name="checkoutAddress" value={address.id} checked={draftId === address.id} onChange={() => setDraftId(address.id)} />
          <span className={styles.optionBody}><span className={styles.addressLabel}><strong>{address.label}</strong>{address.isDefault && <span>Utama</span>}</span>
            <AddressDetails address={address} />
          </span>
        </label>)}
      </fieldset>
      <div className={styles.dialogActions}>
        <Link href={createHref} onClick={() => setOpen(false)} className="action-button action-button--outline action-button--sm"><Icon name="plus" />Tambah alamat</Link>
        <Button disabled={!draftId} size="sm" icon={<AddressSymbol name="check" />}
          onClick={() => { if (draftId) { onSelect(draftId); setOpen(false); } }}>Gunakan alamat ini</Button>
      </div>
      </>}
    </dialog>
  </section>;
}
