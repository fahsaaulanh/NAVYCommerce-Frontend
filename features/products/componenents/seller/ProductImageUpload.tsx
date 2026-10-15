"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";
import ProductIcon from "../shared/ProductIcon";
import { uploadProductImageAction } from "../../actions/image-actions";
import {
  MAX_IMAGE_ALT_TEXT,
  MAX_PRODUCT_IMAGES,
  validateImageFile,
} from "../../utils/image-rules";
import type { ProductImage } from "../../types/types";

type ProductImageUploadProps = {
  productId: string;
  imageCount: number;
  onUploaded: (image: ProductImage) => void;
};

export default function ProductImageUpload({
  productId,
  imageCount,
  onUploaded,
}: ProductImageUploadProps) {
  const inputId = useId();
  const descriptionId = useId();
  const helpId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [pending, setPending] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const limitReached = imageCount >= MAX_PRODUCT_IMAGES;

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function clearFile() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setFile(null);
    setPreviewUrl(null);
    setPreviewFailed(false);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setNotice(null);

    const error = validateImageFile(selectedFile);

    if (error) {
      clearFile();
      setNotice({ type: "error", message: error });
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const url = URL.createObjectURL(selectedFile);

    objectUrlRef.current = url;

    setFile(selectedFile);
    setPreviewUrl(url);
    setPreviewFailed(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submittingRef.current || limitReached) {
      return;
    }

    if (!file) {
      setNotice({
        type: "error",
        message: "Pilih gambar terlebih dahulu.",
      });
      return;
    }

    submittingRef.current = true;
    setPending(true);
    setNotice(null);

    const formData = new FormData();

    formData.append("file", file, file.name);
    formData.append("altText", altText);

    try {
      const result = await uploadProductImageAction(
        productId,
        formData,
      );

      if (!result.ok) {
        setNotice({
          type: "error",
          message: result.message,
        });
        return;
      }

      clearFile();
      setAltText("");

      setNotice({
        type: "success",
        message: "Gambar berhasil ditambahkan.",
      });

      onUploaded(result.image);
    } catch {
      setNotice({
        type: "error",
        message:
          "Hasil upload belum dapat dikonfirmasi. Muat ulang galeri sebelum mencoba kembali.",
      });
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-2xl border border-border bg-background/60 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ProductIcon name="upload" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Tambahkan gambar
          </h3>

          <p id={helpId} className="mt-1 text-xs leading-5 text-muted">
            JPG, PNG, atau WebP. Maksimal 5 MB per gambar dan
            10 gambar per produk.
          </p>
        </div>
      </div>

      {limitReached ? (
        <p className="mt-4 rounded-xl border border-border bg-surface p-3 text-sm text-muted">
          Galeri sudah berisi 10 gambar. Hapus salah satu gambar
          untuk menambahkan gambar baru.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={pending}
              aria-describedby={helpId}
              onChange={handleFileChange}
              className="peer sr-only"
            />

            <label
              htmlFor={inputId}
              className={[
                "flex min-h-28 items-center justify-center gap-3 rounded-xl border border-dashed border-primary/30 bg-surface p-4 transition-colors",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary",
                pending
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-primary hover:bg-primary/5",
              ].join(" ")}
            >
              <ProductIcon
                name="image"
                className="size-7 shrink-0 text-primary"
              />

              <span className="text-center">
                <span className="block text-sm font-semibold text-foreground">
                  {file ? "Ganti gambar pilihan" : "Pilih gambar"}
                </span>

                <span className="mt-1 block text-xs text-muted">
                  Buka file dari perangkat kamu
                </span>
              </span>
            </label>
          </div>

          {file && previewUrl && (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-surface p-3">
              <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
                {previewFailed ? (
                  <ProductIcon
                    name="image"
                    className="size-7 text-muted"
                  />
                ) : (
                  <Image
                    key={previewUrl}
                    src={previewUrl}
                    alt="Preview gambar yang akan diunggah"
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-contain"
                    onError={() => setPreviewFailed(true)}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-medium text-foreground">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-muted">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => {
                  clearFile();
                  setNotice(null);
                }}
              >
                Batal
              </Button>
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor={descriptionId}
                className="text-xs font-semibold text-foreground"
              >
                Deskripsi gambar
                <span className="ml-1 font-normal text-muted">
                  (opsional)
                </span>
              </label>

              <span className="text-xs text-muted">
                {altText.length}/{MAX_IMAGE_ALT_TEXT}
              </span>
            </div>

            <input
              id={descriptionId}
              type="text"
              value={altText}
              maxLength={MAX_IMAGE_ALT_TEXT}
              disabled={pending}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Contoh: Buket pink dengan pita putih"
              className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
            />

            <p className="mt-2 text-xs leading-5 text-muted">
              Jika kosong, backend menggunakan nama produk.
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              variant="secondary"
              icon={<ProductIcon name="upload" className="size-4" />}
              loading={pending}
              disabled={!file || previewFailed}
              className="w-full sm:w-auto"
            >
              Upload gambar
            </Button>
          </div>
        </>
      )}

      {notice && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={[
            "mt-4 rounded-xl px-3 py-3 text-sm leading-6",
            notice.type === "success"
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger",
          ].join(" ")}
        >
          {notice.message}
        </p>
      )}
    </form>
  );
}