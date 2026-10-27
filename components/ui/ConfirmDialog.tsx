"use client";

import { useEffect, useId, useRef } from "react";
import Button from "./Button";
import styles from "./confirm-dialog.module.css";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending: boolean;
  confirmDisabled?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = "Batal", pending, confirmDisabled = false, error, onConfirm, onClose }: Props) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open) {
      if (!element.open) element.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previousOverflow; };
    }
    if (element.open) element.close();
  }, [open]);

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
    onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
    <div className={styles.content}>
      <span className={styles.marker} aria-hidden="true">!</span>
      <h2 id={`${id}-title`}>{title}</h2>
      <p id={`${id}-description`}>{description}</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button variant="outline" disabled={pending} onClick={onClose} autoFocus>{cancelLabel}</Button>
        <Button variant="danger" loading={pending} disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </dialog>;
}
