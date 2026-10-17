"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Icon from "@/components/ui/Icon";
import RegionPicker from "@/features/regions/components/RegionPicker";
import { useRegionPicker } from "@/features/regions/hooks/useRegionPicker";
import { saveAddressAction } from "../actions/address-actions";
import type { AddressActionResult, CustomerAddress } from "../types/address";
import AddressSymbol from "./AddressSymbol";
import styles from "./addresses.module.css";

type Props = { address?: CustomerAddress; defaultRecipient: string; returnTo?: string };

export default function AddressForm({ address, defaultRecipient, returnTo }: Props) {
  const router = useRouter();
  const feedback = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AddressActionResult | null>(null);
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? "");
  const regionPicker = useRegionPicker({
    provinceCode: address?.provinceCode ?? "", cityCode: address?.cityCode ?? "",
    districtCode: address?.districtCode ?? "", villageCode: address?.villageCode ?? "",
  });
  const failure = result?.ok === false ? result : null;
  useEffect(() => { if (failure) feedback.current?.focus(); }, [failure]);
  const errors = failure?.fieldErrors ?? {};
  const blocked = pending || !!failure?.outcomeUnknown || !!failure?.authRequired;

  function errorProps(name: string) {
    return {
      "aria-invalid": !!errors[name]?.length,
      "aria-describedby": errors[name]?.length ? `address-${name}-error` : undefined
    };
  }
  function fieldError(name: string) {
    return errors[name]?.length ? <p id={`address-${name}-error`} className={styles.fieldError}>{errors[name].join(" ")}</p> : null;
  }

  return <div className={styles.formLayout}>
    <form className={styles.form} onSubmit={event => {
      event.preventDefault();
      if (blocked || !regionPicker.ready) return;
      const formData = new FormData(event.currentTarget);
      setResult(null);
      startTransition(async () => {
        try {
          const next = await saveAddressAction(address?.id ?? null, formData);
          if (next.ok) {
            if (returnTo) {
              const target = new URL(returnTo, window.location.origin);
              if (next.addressId) target.searchParams.set("address", next.addressId);
              router.push(target.pathname + target.search);
            } else router.push(`/account/addresses?notice=${address ? "updated" : "created"}`);
          }
          else setResult(next);
        } catch {
          setResult({
            ok: false, fieldErrors: {}, outcomeUnknown: true,
            message: "Status penyimpanan belum dapat dipastikan. Periksa daftar alamat sebelum mengulangi."
          });
        }
      });
    }}>
      {failure && <div ref={feedback} tabIndex={-1} className={`${styles.notice} ${styles.noticeError}`} role="alert">
        <p>{failure.message}</p>
        {failure.authRequired && <Link href="/auth">Masuk kembali</Link>}
        {failure.outcomeUnknown && <Link href="/account/addresses">Periksa daftar alamat</Link>}
      </div>}
      <fieldset className={styles.formFields} disabled={blocked}>
        <section className={styles.formSection} aria-labelledby="recipient-heading">
          <div className={styles.sectionHeading}><span>01</span><div><h2 id="recipient-heading">Penerima</h2><p>Kontak yang bisa dihubungi saat pengiriman.</p></div></div>
          <div className={styles.fields}>
            <div><FormField id="address-label" name="label" label="Label alamat" required maxLength={50} defaultValue={address?.label ?? ""}
              hint="Contoh: Rumah, Kantor, atau Kos." autoComplete="off" {...errorProps("label")} />{fieldError("label")}</div>
            <div className={styles.twoColumns}>
              <div><FormField id="address-recipientName" name="recipientName" label="Nama penerima" required maxLength={150}
                defaultValue={address?.recipientName ?? defaultRecipient} autoComplete="shipping name" {...errorProps("recipientName")} />{fieldError("recipientName")}</div>
              <div><FormField id="address-phoneNumber" name="phoneNumber" label="Nomor telepon" type="tel" inputMode="tel" required maxLength={16}
                pattern="\+?[0-9]{8,15}" defaultValue={address?.phoneNumber ?? ""} autoComplete="shipping tel"
                hint="Contoh: 081234567890 atau +6281234567890." {...errorProps("phoneNumber")} />{fieldError("phoneNumber")}</div>
            </div>
          </div>
        </section>
        <section className={styles.formSection} aria-labelledby="region-heading">
          <div className={styles.sectionHeading}><span>02</span><div><h2 id="region-heading">Wilayah pengiriman</h2><p>Pilih berurutan dari provinsi hingga kelurahan atau desa.</p></div></div>
          <RegionPicker picker={regionPicker} disabled={blocked} error={errors.villageCode?.join(" ")}
            onChange={(next, suggestedPostalCode) => { regionPicker.setValue(next); setPostalCode(suggestedPostalCode); }} />
          <div className={styles.postalField}><FormField id="address-postalCode" name="postalCode" label="Kode pos" required maxLength={5} pattern="[0-9]{5}" inputMode="numeric"
            value={postalCode} onChange={event => setPostalCode(event.target.value)} autoComplete="shipping postal-code"
            hint="Terisi dari pilihan wilayah jika tersedia. Periksa kembali sebelum menyimpan." {...errorProps("postalCode")} />{fieldError("postalCode")}</div>
        </section>
        <section className={styles.formSection} aria-labelledby="street-heading">
          <div className={styles.sectionHeading}><span>03</span><div><h2 id="street-heading">Detail alamat</h2><p>Tulis lokasi selengkap mungkin agar mudah ditemukan.</p></div></div>
          <div className={styles.fields}>
            <div className={styles.textareaField}>
              <label htmlFor="address-addressLine">Alamat lengkap <span aria-hidden="true">*</span></label>
              <textarea id="address-addressLine" name="addressLine" required maxLength={500} rows={3} defaultValue={address?.addressLine ?? ""}
                placeholder="Nama jalan, nomor rumah, gedung, lantai, RT/RW…" autoComplete="shipping street-address" {...errorProps("addressLine")} />
              {fieldError("addressLine")}
            </div>
            <div><FormField id="address-deliveryNotes" name="deliveryNotes" label="Catatan pengiriman (opsional)" maxLength={250}
              defaultValue={address?.deliveryNotes ?? ""} hint="Contoh: pagar putih atau patokan di dekat rumah." {...errorProps("deliveryNotes")} />{fieldError("deliveryNotes")}</div>
          </div>
        </section>
      </fieldset>
      <div className={styles.formFooter}>
        <p>Periksa nama penerima dan nomor telepon sebelum menyimpan.</p>
        <div>
          <Link href={returnTo ?? "/account/addresses"} className="action-button action-button--outline" aria-disabled={pending}
            onClick={event => { if (pending) event.preventDefault(); }}>Batal</Link>
          <Button type="submit" loading={pending} disabled={blocked || !regionPicker.ready} icon={<AddressSymbol name="check" />}>{address ? "Simpan perubahan" : "Simpan alamat"}</Button>
        </div>
      </div>
    </form>
    <aside className={styles.formAside}>
      <span className={styles.asideIcon}><AddressSymbol name="pin" /></span>
      <h2>Tujuan yang tepat, pengiriman lebih mudah.</h2>
      <p>Alamat yang lengkap membantu penjual dan kurir mengirimkan pesanan ke tempat yang benar.</p>
      <ul><li><AddressSymbol name="check" />Gunakan nomor penerima yang aktif.</li><li><AddressSymbol name="check" />Sertakan nomor rumah atau unit.</li><li><AddressSymbol name="check" />Tambahkan patokan bila diperlukan.</li></ul>
      <div className={styles.asideNote}><Icon name="user" /><p>Alamat tersimpan di akunmu. Kamu dapat mengubah atau menghapusnya kapan saja.</p></div>
    </aside>
  </div>;
}
