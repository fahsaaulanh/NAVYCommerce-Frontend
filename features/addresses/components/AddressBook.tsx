"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deleteAddressAction, setDefaultAddressAction } from "../actions/address-actions";
import type { AddressActionResult, CustomerAddress } from "../types/address";
import AddressSymbol from "./AddressSymbol";
import styles from "./addresses.module.css";

type Props = { addresses: CustomerAddress[]; notice?: string };

export default function AddressBook({ addresses, notice }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AddressActionResult | null>(null);
  const [deleting, setDeleting] = useState<CustomerAddress | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function run(kind: "default" | "delete", id: string) {
    if (pending) return;
    setResult(null);
    setBusyId(id);
    startTransition(async () => {
      try {
        const next = await (kind === "delete" ? deleteAddressAction(id) : setDefaultAddressAction(id));
        setResult(next);
        if (next.ok) setDeleting(null);
      } catch {
        setResult({ ok: false, fieldErrors: {}, outcomeUnknown: true,
          message: "Status perubahan belum dapat dipastikan. Muat ulang daftar alamat sebelum mencoba kembali." });
      } finally { setBusyId(null); }
    });
  }

  const feedback = result?.message || notice;
  const failed = result?.ok === false;
  const defaultAddress = addresses.find(address => address.isDefault);

  return <>
    {feedback && <div className={`${styles.notice} ${failed ? styles.noticeError : ""}`} role={failed ? "alert" : "status"}>
      {feedback}
      {failed && result.authRequired && <Link href="/auth">Masuk kembali</Link>}
      {failed && result.outcomeUnknown && <a href="/account/addresses">Muat ulang daftar alamat</a>}
    </div>}
    {addresses.length === 0 ? <div className={styles.empty}>
      <span className={styles.emptyIcon}><AddressSymbol name="pin" /></span>
      <p className={styles.eyebrow}>Siapkan tujuan belanjamu</p>
      <h2>Belum ada alamat pengiriman</h2>
      <p>Simpan alamat rumah atau kantor agar kamu tidak perlu mengisinya lagi saat checkout.</p>
      <Link href="/account/addresses/new" className="action-button action-button--primary"><Icon name="plus" />Tambah alamat pertama</Link>
      <span className={styles.emptyNote}>Alamat pertama otomatis menjadi alamat utama.</span>
    </div> : <>
      <div className={styles.overview}>
        <span><strong>{addresses.length}</strong> alamat tersimpan</span>
        <span><AddressSymbol name="check" />{defaultAddress ? `Alamat utama: ${defaultAddress.label}` : "Belum ada alamat utama"}</span>
      </div>
      <ul className={styles.addressList}>
        {addresses.map(address => <li key={address.id}>
          <article className={`${styles.card} ${address.isDefault ? styles.defaultCard : ""}`} aria-label={`Alamat ${address.label}`}>
            <div className={styles.cardHeader}>
              <span className={styles.addressIcon}><AddressSymbol name="pin" /></span>
              <h2>{address.label}</h2>
              {address.isDefault && <span className={styles.badge}><AddressSymbol name="check" />Utama</span>}
            </div>
            <div className={styles.recipient}><strong>{address.recipientName}</strong><span>{address.phoneNumber}</span></div>
            <p className={styles.street}>{address.addressLine}</p>
            <p className={styles.locality}>{[address.village, address.district, address.city, address.province].filter(Boolean).join(", ")} {address.postalCode}</p>
            {address.deliveryNotes && <p className={styles.deliveryNotes}><span>Catatan:</span> {address.deliveryNotes}</p>}
            <div className={styles.cardActions}>
              <Link href={`/account/addresses/${address.id}/edit`} aria-disabled={pending}
                onClick={event => { if (pending) event.preventDefault(); }}
                className="action-button action-button--outline action-button--sm"><AddressSymbol name="edit" />Ubah alamat</Link>
              {!address.isDefault && <Button variant="secondary" size="sm" disabled={pending || (failed && !!result.outcomeUnknown)}
                loading={pending && busyId === address.id && !deleting} icon={<AddressSymbol name="check" />}
                onClick={() => run("default", address.id)}>Jadikan utama</Button>}
              <Button variant="ghost" size="sm" className={styles.deleteButton} disabled={pending || (failed && !!result.outcomeUnknown)}
                icon={<Icon name="trash" />} aria-haspopup="dialog" aria-label={`Hapus alamat ${address.label}`}
                onClick={() => { setResult(null); setDeleting(address); }}>Hapus</Button>
            </div>
          </article>
        </li>)}
      </ul>
      <p className={styles.listNote}>Alamat utama akan menjadi pilihan awal pada proses checkout.</p>
    </>}
    <ConfirmDialog open={!!deleting} title={`Hapus alamat ${deleting?.label ?? ""}?`}
      description={deleting?.isDefault && addresses.length > 1
        ? "Alamat ini akan dihapus. Alamat tersisa yang paling lama dibuat akan otomatis menjadi alamat utama."
        : "Alamat ini akan dihapus dari daftar alamat pengirimanmu. Kamu bisa menambahkan alamat baru setelahnya."}
      confirmLabel="Hapus alamat" pending={pending} confirmDisabled={failed && !!result.outcomeUnknown}
      error={deleting && failed ? result.message : undefined}
      onClose={() => { if (!pending) setDeleting(null); }}
      onConfirm={() => { if (deleting && !(failed && result.outcomeUnknown)) run("delete", deleting.id); }} />
  </>;
}
