"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Icon from "@/components/ui/Icon";
import RegionPicker from "@/features/regions/components/RegionPicker";
import { useRegionPicker } from "@/features/regions/hooks/useRegionPicker";
import type { Store } from "@/features/stores/types";
import { saveStoreShippingOriginAction } from "../actions";
import type {
  StoreShippingOrigin,
  StoreShippingOriginActionResult,
} from "../types";
import styles from "./shipping-origin.module.css";

type Props = {
  store: Store;
  origin: StoreShippingOrigin | null;
  defaultContact: string;
};

export default function ShippingOriginForm({
  store,
  origin,
  defaultContact,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<StoreShippingOriginActionResult | null>(
    null,
  );
  const [postalCode, setPostalCode] = useState(origin?.postalCode ?? "");
  const feedback = useRef<HTMLDivElement>(null);
  const picker = useRegionPicker({
    provinceCode: origin?.provinceCode ?? "",
    cityCode: origin?.cityCode ?? "",
    districtCode: origin?.districtCode ?? "",
    villageCode: origin?.villageCode ?? "",
  });
  const failure = result?.ok === false ? result : null;
  const errors = failure?.fieldErrors ?? {};
  const blocked =
    pending || !!failure?.authRequired || !!failure?.outcomeUnknown;
  const pageHref = `/seller/stores/${store.id}/shipping-origin`;
  useEffect(() => {
    if (failure) feedback.current?.focus();
  }, [failure]);

  function fieldProps(name: string) {
    return {
      "aria-invalid": !!errors[name]?.length,
      "aria-describedby": errors[name]?.length
        ? `origin-${name}-error`
        : undefined,
    };
  }
  function fieldError(name: string) {
    return errors[name]?.length ? (
      <p id={`origin-${name}-error`} className={styles.fieldError}>
        {errors[name].join(" ")}
      </p>
    ) : null;
  }

  return (
    <div className={styles.layout}>
      <form
        className={styles.form}
        aria-label="Alamat asal pengiriman toko"
        onSubmit={(event) => {
          event.preventDefault();
          if (blocked || !picker.ready) return;
          const data = new FormData(event.currentTarget);
          setResult(null);
          startTransition(async () => {
            try {
              const next = await saveStoreShippingOriginAction(store.id, data);
              if (next.ok) {
                router.replace(`${pageHref}?notice=saved`);
                router.refresh();
              } else setResult(next);
            } catch {
              setResult({
                ok: false,
                fieldErrors: {},
                outcomeUnknown: true,
                message:
                  "Status penyimpanan belum dapat dipastikan. Muat ulang alamat sebelum mencoba kembali.",
              });
            }
          });
        }}
      >
        <div className={styles.formIntro}>
          <h2>Detail alamat asal</h2>
          <p>
            Kolom bertanda * wajib diisi. Gunakan alamat tempat paket disiapkan.
          </p>
        </div>
        {failure && (
          <div
            className={`${styles.notice} ${styles.errorNotice}`}
            role="alert"
            ref={feedback}
            tabIndex={-1}
          >
            <p>{failure.message}</p>
            {failure.authRequired && <Link href="/auth">Masuk kembali</Link>}
            {failure.outcomeUnknown && (
              <a href={pageHref}>Muat ulang alamat tersimpan</a>
            )}
          </div>
        )}
        <fieldset disabled={blocked} className={styles.formFields}>
          <section
            className={styles.section}
            aria-labelledby="origin-contact-heading"
          >
            <div className={styles.sectionHeading}>
              <span>01</span>
              <div>
                <h3 id="origin-contact-heading">Kontak pengirim</h3>
                <p>Orang yang dapat dihubungi terkait pengiriman paket.</p>
              </div>
            </div>
            <div className={styles.twoColumns}>
              <div>
                <FormField
                  id="origin-contactName"
                  name="contactName"
                  label="Nama kontak *"
                  required
                  maxLength={150}
                  defaultValue={origin?.contactName ?? defaultContact}
                  autoComplete="section-origin name"
                  {...fieldProps("contactName")}
                />
                {fieldError("contactName")}
              </div>
              <div>
                <FormField
                  id="origin-phoneNumber"
                  name="phoneNumber"
                  label="Nomor telepon *"
                  type="tel"
                  inputMode="tel"
                  required
                  maxLength={16}
                  pattern="\+?[0-9]{8,15}"
                  defaultValue={origin?.phoneNumber ?? ""}
                  autoComplete="section-origin tel"
                  hint="8–15 digit. Contoh: 081234567890."
                  {...fieldProps("phoneNumber")}
                />
                {fieldError("phoneNumber")}
              </div>
            </div>
          </section>
          <section
            className={styles.section}
            aria-labelledby="origin-region-heading"
          >
            <div className={styles.sectionHeading}>
              <span>02</span>
              <div>
                <h3 id="origin-region-heading">Wilayah asal</h3>
                <p>Pilih wilayah sesuai lokasi toko atau tempat penjemputan.</p>
              </div>
            </div>
            <RegionPicker
              picker={picker}
              disabled={blocked}
              error={errors.villageCode?.join(" ")}
              onChange={(next, suggestedPostalCode) => {
                picker.setValue(next);
                setPostalCode(suggestedPostalCode);
              }}
            />
            <div className={styles.postalField}>
              <FormField
                id="origin-postalCode"
                name="postalCode"
                label="Kode pos *"
                required
                maxLength={5}
                pattern="[0-9]{5}"
                inputMode="numeric"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                autoComplete="section-origin postal-code"
                hint="Periksa kembali kode pos. Kamu dapat mengubahnya jika diperlukan."
                {...fieldProps("postalCode")}
              />
              {fieldError("postalCode")}
            </div>
          </section>
          <section
            className={styles.section}
            aria-labelledby="origin-street-heading"
          >
            <div className={styles.sectionHeading}>
              <span>03</span>
              <div>
                <h3 id="origin-street-heading">Lokasi penjemputan</h3>
                <p>Tambahkan detail yang membantu kurir menemukan lokasi.</p>
              </div>
            </div>
            <div className={styles.fields}>
              <div className={styles.textareaField}>
                <label htmlFor="origin-addressLine">
                  Alamat lengkap <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="origin-addressLine"
                  name="addressLine"
                  required
                  maxLength={500}
                  rows={4}
                  defaultValue={origin?.addressLine ?? ""}
                  autoComplete="section-origin street-address"
                  placeholder="Nama jalan, nomor bangunan, RT/RW, lantai atau unit…"
                  {...fieldProps("addressLine")}
                />
                {fieldError("addressLine")}
              </div>
              <div>
                <FormField
                  id="origin-pickupNotes"
                  name="pickupNotes"
                  label="Catatan penjemputan (opsional)"
                  maxLength={250}
                  defaultValue={origin?.pickupNotes ?? ""}
                  hint="Contoh: masuk melalui pintu samping, hubungi kontak saat tiba."
                  {...fieldProps("pickupNotes")}
                />
                {fieldError("pickupNotes")}
              </div>
            </div>
          </section>
        </fieldset>
        <footer className={styles.formFooter}>
          <p>Perubahan berlaku setelah alamat berhasil disimpan.</p>
          <div>
            <Link
              href={`/seller/stores/${store.id}`}
              className="action-button action-button--outline"
              aria-disabled={pending}
              onClick={(event) => {
                if (pending) event.preventDefault();
              }}
            >
              Kembali ke toko
            </Link>
            <Button
              type="submit"
              loading={pending}
              disabled={blocked || !picker.ready}
              icon={<Icon name="arrow-right" />}
            >
              {origin ? "Simpan perubahan" : "Simpan alamat asal"}
            </Button>
          </div>
        </footer>
      </form>
      <aside className={styles.aside}>
        <section
          className={styles.storeCard}
          aria-labelledby="origin-store-heading"
        >
          <span className={styles.storeIcon}>
            <Icon name="store" className="size-6" />
          </span>
          <p className={styles.eyebrow}>Pengaturan toko</p>
          <h2 id="origin-store-heading">{store.name}</h2>
          <p className={styles.slug}>/{store.slug}</p>
          <span
            className={`${styles.badge} ${origin ? styles.saved : styles.missing}`}
          >
            {origin ? "Alamat sudah tersimpan" : "Alamat belum diatur"}
          </span>
          {origin ? (
            <div className={styles.savedAddress}>
              <h3>Alamat tersimpan</h3>
              <p>{origin.addressLine}</p>
              <p>
                {origin.village}, {origin.district}, {origin.city},{" "}
                {origin.province} {origin.postalCode}
              </p>
            </div>
          ) : (
            <p className={styles.asideDescription}>
              Lengkapi alamat asal untuk menyiapkan pengiriman dari toko ini.
            </p>
          )}
        </section>
        <section className={styles.helpCard}>
          <h2>Sebelum menyimpan</h2>
          <ul>
            <li>
              <span>1</span>Gunakan lokasi tempat paket akan diserahkan kepada
              kurir.
            </li>
            <li>
              <span>2</span>Pastikan nomor kontak aktif dan dapat dihubungi.
            </li>
            <li>
              <span>3</span>Periksa kelurahan, kode pos, dan nomor bangunan.
            </li>
          </ul>
          <p className={styles.privacyNote}>
            Alamat dan kontak ini digunakan untuk pengaturan pengiriman toko.
          </p>
        </section>
      </aside>
    </div>
  );
}
