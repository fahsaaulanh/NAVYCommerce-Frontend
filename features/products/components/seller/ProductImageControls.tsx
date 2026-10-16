"use client";

import {
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";
import ProductIcon from "../shared/ProductIcon";
import {
  deleteProductImageAction,
  updateProductImageAltTextAction,
} from "../../actions/image-actions";
import { MAX_IMAGE_ALT_TEXT } from "../../utils/image-rules";
import type { ProductImage } from "../../types/types";

type ProductImageControlsProps = {
  productId: string;
  image: ProductImage;
  usedBy: string[];
  disabled?: boolean;
  onUpdated: (message: string) => void;
  onDeleted: (message: string) => void;
};

export default function ProductImageControls({
  productId,
  image,
  usedBy,
  disabled = false,
  onUpdated,
  onDeleted,
}: ProductImageControlsProps) {
  const descriptionId = useId();
  const editTitleId = useId();
  const editDescriptionId = useId();
  const editErrorId = useId();
  const deleteTitleId = useId();
  const deleteDescriptionId = useId();

  const editDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const busyRef = useRef(false);

  const [altText, setAltText] = useState(image.altText);

  const [pending, setPending] = useState<
    "edit" | "delete" | null
  >(null);

  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(
    null,
  );

  const busy = pending !== null || disabled;
  const inUse = usedBy.length > 0;

  const normalizedAltText = altText.trim();

  const canSave =
    normalizedAltText.length > 0 &&
    normalizedAltText.length <= MAX_IMAGE_ALT_TEXT &&
    normalizedAltText !== image.altText.trim();

  const dialogClassName =
    "m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg " +
    "overflow-y-auto rounded-3xl border border-border " +
    "bg-surface p-0 text-foreground shadow-2xl " +
    "backdrop:bg-panel/60 backdrop:backdrop-blur-sm";

  function openEditDialog() {
    if (busy || busyRef.current) {
      return;
    }

    setAltText(image.altText);
    setEditError(null);

    if (!editDialogRef.current?.open) {
      editDialogRef.current?.showModal();
    }
  }

  function openDeleteDialog() {
    if (busy || busyRef.current || inUse) {
      return;
    }

    setDeleteError(null);

    if (!deleteDialogRef.current?.open) {
      deleteDialogRef.current?.showModal();
    }
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy || busyRef.current || !canSave) {
      return;
    }

    busyRef.current = true;
    setPending("edit");
    setEditError(null);

    try {
      const result = await updateProductImageAltTextAction(
        productId,
        image.id,
        normalizedAltText,
      );

      if (!result.ok) {
        setEditError(result.message);
        return;
      }

      editDialogRef.current?.close();
      onUpdated(result.message);
    } catch {
      setEditError(
        "Hasil perubahan belum dapat dikonfirmasi. Muat ulang galeri.",
      );
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  }

  async function handleDelete(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy || busyRef.current || inUse) {
      return;
    }

    busyRef.current = true;
    setPending("delete");
    setDeleteError(null);

    try {
      const result = await deleteProductImageAction(
        productId,
        image.id,
      );

      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }

      deleteDialogRef.current?.close();
      onDeleted(result.message);
    } catch {
      setDeleteError(
        "Hasil penghapusan belum dapat dikonfirmasi. Muat ulang galeri.",
      );
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted">
            Deskripsi gambar terpilih
          </p>

          <p className="mt-2 break-words text-sm leading-6 text-foreground">
            {image.altText || "Belum ada deskripsi gambar."}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<ProductIcon name="edit" className="size-4" />}
            disabled={busy}
            aria-haspopup="dialog"
            onClick={openEditDialog}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={<ProductIcon name="trash" className="size-4" />}
            disabled={busy || inUse}
            aria-haspopup="dialog"
            onClick={openDeleteDialog}
          >
            Hapus
          </Button>
        </div>
      </div>

      {inUse && (
        <p className="mt-3 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted">
          Digunakan oleh {usedBy.join(", ")}. Ganti atau lepaskan
          hubungan gambar pada opsi tersebut sebelum menghapus.
        </p>
      )}

      {/* Dialog edit deskripsi */}
      <dialog
        ref={editDialogRef}
        aria-labelledby={editTitleId}
        aria-describedby={editDescriptionId}
        onCancel={(event) => {
          if (busyRef.current) {
            event.preventDefault();
          }
        }}
        className={dialogClassName}
      >
        <form onSubmit={handleSave}>
          <div className="border-b border-border p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ProductIcon name="edit" className="size-6" />
              </div>

              <div>
                <h3
                  id={editTitleId}
                  className="text-xl font-semibold tracking-tight"
                >
                  Edit deskripsi gambar
                </h3>

                <p
                  id={editDescriptionId}
                  className="mt-2 text-sm leading-6 text-muted"
                >
                  Jelaskan isi gambar agar mudah dipahami,
                  termasuk oleh pengguna pembaca layar.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor={descriptionId}
                className="text-sm font-semibold text-foreground"
              >
                Deskripsi gambar
              </label>

              <span className="text-xs text-muted">
                {altText.length}/{MAX_IMAGE_ALT_TEXT}
              </span>
            </div>

            <textarea
              autoFocus
              id={descriptionId}
              value={altText}
              required
              maxLength={MAX_IMAGE_ALT_TEXT}
              rows={4}
              disabled={busy}
              aria-invalid={editError ? true : undefined}
              aria-describedby={
                editError ? editErrorId : undefined
              }
              onChange={(event) => {
                setAltText(event.target.value);
                setEditError(null);
              }}
              placeholder="Contoh: Buket wisuda pink dengan pita putih"
              className="mt-3 min-h-32 w-full resize-y rounded-xl border border-border bg-background/60 px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
            />

            <p className="mt-3 text-xs leading-5 text-muted">
              Sebutkan warna, bentuk, atau detail penting yang
              membedakan gambar ini.
            </p>

            {editError && (
              <p
                id={editErrorId}
                role="alert"
                className="mt-4 rounded-xl bg-danger-soft p-3 text-sm leading-6 text-danger"
              >
                {editError}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border bg-background/40 p-6 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => editDialogRef.current?.close()}
            >
              Batal
            </Button>

            <Button
              type="submit"
              loading={pending === "edit"}
              disabled={disabled || pending === "delete" || !canSave}
              icon={<ProductIcon name="check" className="size-4" />}
            >
              Simpan deskripsi
            </Button>
          </div>
        </form>
      </dialog>

      {/* Dialog konfirmasi hapus */}
      <dialog
        ref={deleteDialogRef}
        aria-labelledby={deleteTitleId}
        aria-describedby={deleteDescriptionId}
        onCancel={(event) => {
          if (busyRef.current) {
            event.preventDefault();
          }
        }}
        className={dialogClassName}
      >
        <form onSubmit={handleDelete} className="p-6 sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <ProductIcon name="trash" className="size-6" />
          </div>

          <h3
            id={deleteTitleId}
            className="mt-5 text-xl font-semibold tracking-tight"
          >
            Hapus gambar ini?
          </h3>

          <p
            id={deleteDescriptionId}
            className="mt-3 text-sm leading-6 text-muted"
          >
            Gambar akan dihapus dari galeri dan file-nya
            dijadwalkan untuk dihapus dari penyimpanan.
            Tindakan ini tidak dapat dibatalkan.
          </p>

          <p className="mt-4 break-words rounded-xl bg-background p-3 text-sm">
            {image.altText || "Gambar produk tanpa deskripsi"}
          </p>

          {deleteError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-danger-soft p-3 text-sm leading-6 text-danger"
            >
              {deleteError}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              autoFocus
              variant="outline"
              disabled={busy}
              onClick={() => deleteDialogRef.current?.close()}
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="danger"
              loading={pending === "delete"}
              disabled={disabled || pending === "edit" || inUse}
              icon={<ProductIcon name="trash" className="size-4" />}
            >
              Hapus gambar
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}