"use client";

import {
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";
import ProductIcon from "../shared/ProductIcon";
import { updateProductVariantAction } from "../../actions/variant-actions";
import type { ProductVariant } from "../../types/types";

type ProductVariantEditorProps = {
  productId: string;
  basePrice: number;
  variant: ProductVariant;
  label: string;
  disabled?: boolean;
  onSaved: (message: string) => void;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 2,
});

export default function ProductVariantEditor({
  productId,
  basePrice,
  variant,
  label,
  disabled = false,
  onSaved,
}: ProductVariantEditorProps) {
  const titleId = useId();
  const descriptionId = useId();
  const stockId = useId();
  const adjustmentId = useId();
  const adjustmentHelpId = useId();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const busyRef = useRef(false);

  const [stock, setStock] = useState(String(variant.stockQuantity));
  const [adjustment, setAdjustment] = useState(
    String(variant.priceAdjustment),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stockValue = Number(stock);
  const adjustmentValue = Number(adjustment);

  const validStock =
    /^\d+$/.test(stock.trim()) &&
    Number.isSafeInteger(stockValue) &&
    stockValue >= 0 &&
    stockValue <= 2_147_483_647;

  const validAdjustment =
    /^-?\d+(?:\.\d{1,2})?$/.test(adjustment.trim()) &&
    Number.isFinite(adjustmentValue) &&
    Math.abs(adjustmentValue) <= 999_999_999_999.99;

  const nextPrice = basePrice + adjustmentValue;

  const validPrice =
    validAdjustment &&
    nextPrice >= 0 &&
    nextPrice <= 999_999_999_999.99;

  const changed =
    stockValue !== variant.stockQuantity ||
    adjustmentValue !== variant.priceAdjustment;

  const busy = pending || disabled;

  function openEditor() {
    if (busy || busyRef.current) {
      return;
    }

    setStock(String(variant.stockQuantity));
    setAdjustment(String(variant.priceAdjustment));
    setError(null);

    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      busy ||
      busyRef.current ||
      !changed ||
      !validStock ||
      !validPrice
    ) {
      return;
    }

    busyRef.current = true;
    setPending(true);
    setError(null);

    const formData = new FormData();

    formData.append("stockQuantity", stock.trim());
    formData.append("priceAdjustment", adjustment.trim());

    try {
      const result = await updateProductVariantAction(
        productId,
        variant.id,
        formData,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      dialogRef.current?.close();
      onSaved(result.message);
    } catch {
      setError(
        "Hasil perubahan belum dapat dikonfirmasi. Muat ulang produk.",
      );
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        icon={<ProductIcon name="edit" className="size-4" />}
        aria-haspopup="dialog"
        aria-label={`Edit varian ${label}`}
        onClick={openEditor}
      >
        Edit
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          if (busyRef.current) {
            event.preventDefault();
          }
        }}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-0 text-left text-foreground shadow-2xl backdrop:bg-panel/60 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={handleSave}>
          <div className="border-b border-border p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ProductIcon name="layers" className="size-6" />
              </div>

              <div className="min-w-0">
                <h3
                  id={titleId}
                  className="text-xl font-semibold tracking-tight"
                >
                  Edit varian
                </h3>

                <p
                  id={descriptionId}
                  className="mt-2 break-words text-sm leading-6 text-muted"
                >
                  {label}
                </p>
              </div>
            </div>

            <p className="mt-4 break-all rounded-xl bg-background p-3 font-mono text-xs text-muted">
              {variant.sku}
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label
                htmlFor={stockId}
                className="text-sm font-semibold"
              >
                Stok tersedia
              </label>

              <input
                autoFocus
                id={stockId}
                type="number"
                min={0}
                max={2_147_483_647}
                step={1}
                required
                value={stock}
                disabled={busy}
                onChange={(event) => {
                  setStock(event.target.value);
                  setError(null);
                }}
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-muted">
                Isi 0 jika varian sedang tidak tersedia.
              </p>
            </div>

            <div>
              <label
                htmlFor={adjustmentId}
                className="text-sm font-semibold"
              >
                Penyesuaian harga
              </label>

              <input
                id={adjustmentId}
                type="text"
                required
                value={adjustment}
                disabled={busy}
                aria-describedby={adjustmentHelpId}
                placeholder="Contoh: 20000 atau -10000"
                onChange={(event) => {
                  setAdjustment(event.target.value);
                  setError(null);
                }}
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
              />

              <p
                id={adjustmentHelpId}
                className="mt-2 text-xs leading-5 text-muted"
              >
                Nilai positif menambah harga dasar, nilai negatif
                menguranginya. Gunakan 0 untuk harga yang sama.
                Tulis angka tanpa pemisah ribuan.
              </p>
            </div>

            <dl className="space-y-3 rounded-2xl border border-border bg-background p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Harga dasar</dt>
                <dd className="font-medium">
                  {currency.format(basePrice)}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt className="text-muted">Penyesuaian</dt>
                <dd className="font-medium">
                  {validAdjustment
                    ? `${adjustmentValue > 0 ? "+" : ""}${currency.format(adjustmentValue)}`
                    : "—"}
                </dd>
              </div>

              <div className="flex justify-between gap-3 border-t border-border pt-3">
                <dt className="font-semibold">Harga jual</dt>
                <dd
                  aria-live="polite"
                  className="font-semibold text-primary"
                >
                  {validPrice ? currency.format(nextPrice) : "—"}
                </dd>
              </div>
            </dl>

            {validAdjustment && !validPrice && (
              <p role="alert" className="text-sm text-danger">
                Harga jual tidak boleh negatif atau melebihi batas
                harga yang diizinkan.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-danger-soft p-3 text-sm leading-6 text-danger"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border bg-background/40 p-6 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => dialogRef.current?.close()}
            >
              Batal
            </Button>

            <Button
              type="submit"
              loading={pending}
              disabled={
                disabled ||
                !changed ||
                !validStock ||
                !validPrice
              }
              icon={<ProductIcon name="check" className="size-4" />}
            >
              Simpan perubahan
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}