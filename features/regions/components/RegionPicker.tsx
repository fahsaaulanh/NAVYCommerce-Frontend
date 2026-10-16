"use client";

import type { useRegionPicker } from "../hooks/useRegionPicker";
import type { RegionOption, RegionSelection } from "../types/region";
import styles from "./region-picker.module.css";

type Props = {
  picker: ReturnType<typeof useRegionPicker>;
  disabled?: boolean;
  error?: string;
  onChange: (selection: RegionSelection, suggestedPostalCode: string) => void;
};

type SelectProps = {
  id: string; label: string; placeholder: string; value: string;
  options: RegionOption[]; loading: boolean; disabled: boolean;
  error: string | null; retry: () => void; onChange: (value: string) => void;
  name?: string;
};

function RegionSelect({ id, label, placeholder, value, options, loading, disabled, error, retry, onChange, name }: SelectProps) {
  const missing = !!value && !loading && !error && !options.some(option => option.code === value);
  const message = error || (missing ? "Wilayah tersimpan sudah tidak tersedia. Pilih kembali wilayahnya." : null);
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label} <span aria-hidden="true">*</span></label>
      <select id={id} name={name} value={missing ? "" : value} required disabled={disabled || loading || !!error}
        aria-busy={loading} aria-invalid={!!message} aria-describedby={message ? `${id}-error` : undefined}
        onChange={event => onChange(event.target.value)}>
        <option value="">{loading ? "Memuat pilihan…" : error ? "Pilihan belum tersedia" : placeholder}</option>
        {options.map(option => <option key={option.code} value={option.code}>{option.name}</option>)}
      </select>
      {message && <div className={styles.error} id={`${id}-error`} role="alert">
        <span>{message}</span>
        {error && <button type="button" onClick={retry} disabled={disabled}>Coba lagi</button>}
      </div>}
      {!disabled && !loading && !error && !options.length && <p className={styles.empty}>Tidak ada pilihan wilayah untuk wilayah induk ini.</p>}
    </div>
  );
}

export default function RegionPicker({ picker, disabled = false, error, onChange }: Props) {
  const { value, provinces, cities, districts, villages, provinceValid, cityValid, districtValid } = picker;

  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className="sr-only">Wilayah pengiriman</legend>
      <div className={styles.grid}>
        <RegionSelect {...provinces} id="address-province" label="Provinsi" placeholder="Pilih provinsi" value={value.provinceCode} disabled={disabled}
          onChange={provinceCode => onChange({ provinceCode, cityCode: "", districtCode: "", villageCode: "" }, "")} />
        <RegionSelect {...cities} id="address-city" label="Kabupaten / Kota" placeholder="Pilih kabupaten atau kota" value={value.cityCode} disabled={disabled || !provinceValid}
          onChange={cityCode => onChange({ ...value, cityCode, districtCode: "", villageCode: "" }, "")} />
        <RegionSelect {...districts} id="address-district" label="Kecamatan" placeholder="Pilih kecamatan" value={value.districtCode} disabled={disabled || !cityValid}
          onChange={districtCode => onChange({ ...value, districtCode, villageCode: "" }, "")} />
        <RegionSelect {...villages} id="address-village" name="villageCode" label="Kelurahan / Desa" placeholder="Pilih kelurahan atau desa" value={value.villageCode} disabled={disabled || !districtValid}
          onChange={villageCode => onChange({ ...value, villageCode }, villages.options.find(option => option.code === villageCode)?.postalCode ?? "")} />
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </fieldset>
  );
}
