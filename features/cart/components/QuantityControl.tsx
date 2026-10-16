"use client";

import { useId } from "react";
import Icon from "@/components/ui/Icon";
import styles from "./cart.module.css";

type Props = {
  value: string;
  max: number;
  label: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export default function QuantityControl({ value, max, label, disabled, onChange }: Props) {
  const id = useId();
  const number = Number(value);
  const valid = /^\d+$/.test(value) && Number.isSafeInteger(number) && number >= 1 && number <= max;

  return (
    <div className={styles.quantity}>
      <button type="button" aria-label={`Kurangi ${label}`} disabled={disabled || !valid || number <= 1}
        onClick={() => onChange(String(number - 1))}><Icon name="minus" /></button>
      <label htmlFor={id} className="sr-only">{label}</label>
      <input id={id} type="text" inputMode="numeric" pattern="[0-9]*" value={value}
        disabled={disabled} aria-invalid={!valid} maxLength={10}
        onChange={(event) => { if (/^\d*$/.test(event.target.value)) onChange(event.target.value); }} />
      <button type="button" aria-label={`Tambah ${label}`} disabled={disabled || !valid || number >= max}
        onClick={() => onChange(String(number + 1))}><Icon name="plus" /></button>
    </div>
  );
}
