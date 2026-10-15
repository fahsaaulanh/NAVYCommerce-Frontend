"use client";

import {
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import ProductIcon from "../shared/ProductIcon";
import { renameProductLabelAction } from "../../actions/option-actions";
import type { ProductOption } from "../../types/types";

type LabelEditorProps = {
  productId: string;
  targetId: string;
  kind: "option" | "value";
  label: string;
  context: string;
  disabled: boolean;
  onSaved: (message: string) => void;
};

function LabelEditor({
  productId,
  targetId,
  kind,
  label,
  context,
  disabled,
  onSaved,
}: LabelEditorProps) {
  const inputId = useId();
  const headingId = useId();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const busyRef = useRef(false);

  const [draft, setDraft] = useState(label);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const trimmed = draft.trim();
  const changed = trimmed !== label;
  const valid = trimmed.length > 0 && trimmed.length <= 50;

  function openEditor() {
    setDraft(label);
    setError("");
    dialogRef.current?.showModal();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      busyRef.current ||
      disabled ||
      !valid ||
      !changed
    ) {
      return;
    }

    busyRef.current = true;
    setPending(true);
    setError("");

    try {
      const result = await renameProductLabelAction(
        productId,
        targetId,
        kind,
        trimmed,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      dialogRef.current?.close();
      onSaved(result.message);
    } catch {
      setError(
        "Hasil perubahan belum dapat dipastikan. Muat ulang halaman sebelum mencoba kembali.",
      );
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={openEditor}
        icon={<ProductIcon name="edit" className="size-4" />}
        aria-label={`Edit ${
          kind === "option" ? "nama opsi" : "nilai"
        } ${label}`}
      >
        {label}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        onCancel={(event) => {
          if (busyRef.current) {
            event.preventDefault();
          }
        }}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6 text-foreground shadow-2xl backdrop:bg-panel/60 backdrop:backdrop-blur-sm sm:p-8"
      >
        <form onSubmit={handleSubmit} aria-busy={pending}>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {context}
          </p>

          <h3
            id={headingId}
            className="mt-2 text-xl font-semibold"
          >
            {kind === "option"
              ? "Edit nama opsi"
              : "Edit nilai pilihan"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-muted">
            Perbaiki penamaan tanpa mengubah kombinasi varian,
            stok, harga, atau hubungan gambarnya.
          </p>

          <div className="mt-6">
            <label
              htmlFor={inputId}
              className="mb-2 block text-sm font-semibold"
            >
              {kind === "option" ? "Nama opsi" : "Nilai pilihan"}
            </label>

            <input
              id={inputId}
              autoFocus
              required
              maxLength={50}
              value={draft}
              disabled={pending}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
            />

            <p className="mt-2 text-right text-xs text-muted">
              {draft.length}/50
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
            >
              Batal
            </Button>

            <Button
              type="submit"
              loading={pending}
              disabled={disabled || !valid || !changed}
              icon={
                <ProductIcon name="check" className="size-4" />
              }
            >
              Simpan perubahan
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

type ProductOptionEditorProps = {
  productId: string;
  options: ProductOption[];
  disabled?: boolean;
};

export default function ProductOptionEditor({
  productId,
  options,
  disabled = false,
}: ProductOptionEditorProps) {
  const router = useRouter();
  const headingId = useId();

  const [refreshing, startTransition] = useTransition();
  const [notice, setNotice] = useState("");

  const sortedOptions = [...options].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.id.localeCompare(b.id),
  );

  function handleSaved(message: string) {
    setNotice(message);

    startTransition(() => {
      router.refresh();
    });
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={refreshing}
      className="rounded-3xl border border-border bg-surface p-5 sm:p-7"
    >
      <header className="flex items-start gap-3 border-b border-border pb-5">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          <ProductIcon name="layers" className="size-5" />
        </span>

        <div>
          <h2
            id={headingId}
            className="text-lg font-semibold text-foreground"
          >
            Nama opsi dan pilihan
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted">
            Klik nama atau nilai untuk memperbaiki penulisannya.
            Gunakan pengaturan gambar untuk mengganti foto pilihan.
          </p>
        </div>
      </header>

      {notice && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-success-soft px-4 py-3 text-sm text-success"
        >
          {notice}
        </p>
      )}

      <div className="mt-5 space-y-4">
        {sortedOptions.map((option, index) => (
          <article
            key={option.id}
            className="rounded-2xl border border-border bg-background p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xs font-medium text-muted">
                  Opsi {index + 1}
                </span>

                <LabelEditor
                  key={`${option.id}:${option.name}`}
                  productId={productId}
                  targetId={option.id}
                  kind="option"
                  label={option.name}
                  context={`Opsi ${index + 1}`}
                  disabled={disabled || refreshing}
                  onSaved={handleSaved}
                />
              </div>

              <span className="text-xs text-muted">
                {option.values.length} pilihan
              </span>
            </div>

            <ul className="mt-4 flex flex-wrap gap-2">
              {[...option.values]
                .sort(
                  (a, b) =>
                    a.sortOrder - b.sortOrder ||
                    a.id.localeCompare(b.id),
                )
                .map((value) => (
                  <li
                    key={value.id}
                    className="max-w-full rounded-xl border border-border bg-surface"
                  >
                    <LabelEditor
                      key={`${value.id}:${value.value}`}
                      productId={productId}
                      targetId={value.id}
                      kind="value"
                      label={value.value}
                      context={`Pilihan ${option.name}`}
                      disabled={disabled || refreshing}
                      onSaved={handleSaved}
                    />
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}