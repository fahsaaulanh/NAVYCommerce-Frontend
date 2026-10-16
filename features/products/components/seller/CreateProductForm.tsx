"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import type { Category } from "@/features/categories/types";

import { createProductAction } from "../../actions/create-product-action";

type CreateProductFormProps = {
  storeId: string;
  storeName: string;
  categories: Category[];
};

type DraftOption = {
  id: string;
  name: string;
  values: {
    id: string;
    value: string;
  }[];
};

type IconName = "plus" | "trash" | "save" | "box";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    plus: "M12 5v14M5 12h14",
    trash:
      "M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6",
    save:
      "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h10V3M7 21v-8h10v8",
    box:
      "m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5",
  };

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}

function makeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 hover:border-primary/40 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-60";

const labelClass =
  "mb-2 block text-sm font-semibold text-foreground";

const moneyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 2,
});

export default function CreateProductForm({
  storeId,
  storeName,
  categories,
}: CreateProductFormProps) {
  const router = useRouter();
  const busyRef = useRef(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [price, setPrice] = useState("");
  const [options, setOptions] = useState<DraftOption[]>([]);

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]>
  >({});

  const combinationCount = options.reduce(
    (total, option) => total * option.values.length,
    1,
  );

  const tooManyCombinations = combinationCount > 100;

  const numericPrice = Number(price);
  const pricePreview =
    price && Number.isFinite(numericPrice) && numericPrice > 0
      ? moneyFormatter.format(numericPrice)
      : "Belum diisi";

  function getError(field: string) {
    const matches = Object.entries(fieldErrors).filter(([key]) => {
      const normalized = key
        .replace(/^request\./i, "")
        .toLowerCase();

      return (
        normalized === field.toLowerCase() ||
        normalized.startsWith(`${field.toLowerCase()}[`) ||
        normalized.startsWith(`${field.toLowerCase()}.`)
      );
    });

    return matches.flatMap(([, errors]) => errors).join(" ");
  }

  function errorText(field: string) {
    const error = getError(field);

    return error ? (
      <p
        id={`${field}-error`}
        className="mt-2 text-sm text-danger"
      >
        {error}
      </p>
    ) : null;
  }

  function updateTitle(value: string) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(makeSlug(value));
    }
  }

  function addOption() {
    if (options.length >= 3) return;

    setOptions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        values: [
          {
            id: crypto.randomUUID(),
            value: "",
          },
        ],
      },
    ]);
  }

  function updateOptionName(optionId: string, name: string) {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId ? { ...option, name } : option,
      ),
    );
  }

  function addValue(optionId: string) {
    const newValue = {
      id: crypto.randomUUID(),
      value: "",
    };

    setOptions((current) =>
      current.map((option) =>
        option.id === optionId && option.values.length < 20
          ? {
              ...option,
              values: [...option.values, newValue],
            }
          : option,
      ),
    );
  }

  function updateValue(
    optionId: string,
    valueId: string,
    value: string,
  ) {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values: option.values.map((item) =>
                item.id === valueId ? { ...item, value } : item,
              ),
            }
          : option,
      ),
    );
  }

  function removeValue(optionId: string, valueId: string) {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId && option.values.length > 1
          ? {
              ...option,
              values: option.values.filter(
                (item) => item.id !== valueId,
              ),
            }
          : option,
      ),
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      busyRef.current ||
      tooManyCombinations ||
      categories.length === 0
    ) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    formData.set(
      "options",
      JSON.stringify(
        options.map((option) => ({
          name: option.name,
          values: option.values.map((item) => item.value),
        })),
      ),
    );

    busyRef.current = true;
    setPending(true);
    setMessage("");
    setFieldErrors({});

    let navigating = false;

    try {
      const result = await createProductAction(storeId, formData);

      if (!result.ok) {
        setMessage(result.message);
        setFieldErrors(result.fieldErrors);
        return;
      }

      navigating = true;

      router.replace(
        `/seller/products/${encodeURIComponent(result.productId)}`,
      );
    } catch {
      setMessage(
        "Hasil penyimpanan belum dapat dipastikan. Periksa daftar produk sebelum mencoba kembali.",
      );
    } finally {
      if (!navigating) {
        busyRef.current = false;
        setPending(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={pending}>
      {message && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-danger/20 bg-danger-soft px-5 py-4 text-sm text-danger"
        >
          <p className="font-semibold">Produk belum dapat disimpan</p>
          <p className="mt-1 leading-6">{message}</p>
        </div>
      )}

      <fieldset disabled={pending} className="min-w-0">
        <legend className="sr-only">Form tambah produk</legend>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <header className="border-b border-border pb-5">
                <h2 className="text-lg font-semibold text-foreground">
                  Informasi produk
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Nama dan deskripsi membantu pembeli mengenali
                  produkmu.
                </p>
              </header>

              <div className="mt-6 space-y-6">
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Nama produk
                  </label>

                  <input
                    id="title"
                    name="title"
                    required
                    value={title}
                    onChange={(event) =>
                      updateTitle(event.target.value)
                    }
                    placeholder="Contoh: Buket Wisuda Premium"
                    className={inputClass}
                    aria-invalid={Boolean(getError("title"))}
                    aria-describedby={
                      getError("title") ? "title-error" : undefined
                    }
                  />

                  {errorText("title")}
                </div>

                <div>
                  <label htmlFor="categoryId" className={labelClass}>
                    Kategori
                  </label>

                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    defaultValue=""
                    className={inputClass}
                    aria-invalid={Boolean(getError("categoryId"))}
                    aria-describedby={
                      getError("categoryId")
                        ? "categoryId-error"
                        : undefined
                    }
                  >
                    <option value="" disabled>
                      Pilih kategori produk
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {errorText("categoryId")}

                  {categories.length === 0 && (
                    <p className="mt-2 text-sm text-danger">
                      Belum ada kategori. Buat kategori di backend
                      terlebih dahulu sebelum menambahkan produk.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="slug" className={labelClass}>
                    Slug produk
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    value={slug}
                    onChange={(event) => {
                      setSlugEdited(true);
                      setSlug(event.target.value);
                    }}
                    placeholder="buket-wisuda-premium"
                    className={inputClass}
                    aria-invalid={Boolean(getError("slug"))}
                    aria-describedby="slug-help slug-error"
                  />

                  <p
                    id="slug-help"
                    className="mt-2 text-xs leading-5 text-muted"
                  >
                    Terisi otomatis dari nama produk. Gunakan huruf
                    kecil, angka, dan tanda hubung.
                  </p>

                  {errorText("slug")}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className={labelClass}
                  >
                    Deskripsi
                    <span className="ml-2 font-normal text-muted">
                      Opsional
                    </span>
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    placeholder="Jelaskan bahan, isi paket, ukuran, dan informasi penting lainnya."
                    className={`${inputClass} resize-y`}
                    aria-invalid={Boolean(getError("description"))}
                    aria-describedby={
                      getError("description")
                        ? "description-error"
                        : undefined
                    }
                  />

                  {errorText("description")}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <header className="border-b border-border pb-5">
                <h2 className="text-lg font-semibold text-foreground">
                  Harga dan pengiriman
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Tentukan harga dasar dan berat produk beserta
                  kemasannya.
                </p>
              </header>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="basePrice" className={labelClass}>
                    Harga dasar
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                      Rp
                    </span>

                    <input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      inputMode="decimal"
                      required
                      min="0.01"
                      max="999999999999.99"
                      step="0.01"
                      value={price}
                      onChange={(event) =>
                        setPrice(event.target.value)
                      }
                      placeholder="150000"
                      className={`${inputClass} pl-12`}
                      aria-invalid={Boolean(getError("basePrice"))}
                      aria-describedby="price-help basePrice-error"
                    />
                  </div>

                  <p
                    id="price-help"
                    className="mt-2 text-xs leading-5 text-muted"
                  >
                    Harga tiap varian dapat disesuaikan setelah
                    draft dibuat.
                  </p>

                  {errorText("basePrice")}
                </div>

                <div>
                  <label
                    htmlFor="weightGrams"
                    className={labelClass}
                  >
                    Berat
                  </label>

                  <div className="relative">
                    <input
                      id="weightGrams"
                      name="weightGrams"
                      type="number"
                      inputMode="numeric"
                      required
                      min="1"
                      max="2147483647"
                      step="1"
                      placeholder="500"
                      className={`${inputClass} pr-16`}
                      aria-invalid={Boolean(getError("weightGrams"))}
                      aria-describedby={
                        getError("weightGrams")
                          ? "weightGrams-error"
                          : undefined
                      }
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                      gram
                    </span>
                  </div>

                  {errorText("weightGrams")}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Pilihan varian
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted">
                    Tambahkan pilihan seperti warna, ukuran, atau
                    model.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  icon={<Icon name="plus" />}
                  onClick={addOption}
                  disabled={options.length >= 3}
                >
                  Tambah opsi
                </Button>
              </header>

              {options.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-background px-5 py-8 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon name="box" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-foreground">
                    Produk tanpa pilihan varian
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                    Satu varian dasar akan dibuat untuk mengatur
                    stok. Tambahkan opsi jika pembeli perlu memilih
                    warna, ukuran, atau model.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className="rounded-2xl border border-border bg-background p-4 sm:p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-foreground">
                          Opsi {optionIndex + 1}
                        </h3>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Icon name="trash" />}
                          onClick={() =>
                            setOptions((current) =>
                              current.filter(
                                (item) => item.id !== option.id,
                              ),
                            )
                          }
                        >
                          Hapus opsi
                        </Button>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`option-${option.id}`}
                          className={labelClass}
                        >
                          Nama opsi
                        </label>

                        <input
                          id={`option-${option.id}`}
                          required
                          maxLength={50}
                          value={option.name}
                          onChange={(event) =>
                            updateOptionName(
                              option.id,
                              event.target.value,
                            )
                          }
                          placeholder="Contoh: Warna"
                          className={inputClass}
                        />
                      </div>

                      <fieldset className="mt-5 min-w-0">
                        <legend className={labelClass}>
                          Nilai pilihan
                        </legend>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {option.values.map((item, valueIndex) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2"
                            >
                              <label
                                htmlFor={`value-${item.id}`}
                                className="sr-only"
                              >
                                Nilai {valueIndex + 1} untuk opsi{" "}
                                {optionIndex + 1}
                              </label>

                              <input
                                id={`value-${item.id}`}
                                required
                                maxLength={50}
                                value={item.value}
                                onChange={(event) =>
                                  updateValue(
                                    option.id,
                                    item.id,
                                    event.target.value,
                                  )
                                }
                                placeholder={`Pilihan ${valueIndex + 1}`}
                                className={`${inputClass} min-w-0`}
                              />

                              <Button
                                variant="ghost"
                                size="icon"
                                icon={<Icon name="trash" />}
                                disabled={option.values.length === 1}
                                onClick={() =>
                                  removeValue(option.id, item.id)
                                }
                              >
                                Hapus pilihan {valueIndex + 1}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </fieldset>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Icon name="plus" />}
                          disabled={option.values.length >= 20}
                          onClick={() => addValue(option.id)}
                        >
                          Tambah nilai
                        </Button>

                        <span className="text-xs text-muted">
                          {option.values.length}/20 nilai
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errorText("options")}

              <div
                className={`mt-5 rounded-xl px-4 py-3 text-sm ${
                  tooManyCombinations
                    ? "bg-danger-soft text-danger"
                    : "bg-primary/5 text-muted"
                }`}
                aria-live="polite"
              >
                {tooManyCombinations
                  ? `${combinationCount} kombinasi melebihi batas 100. Kurangi jumlah pilihan.`
                  : `${combinationCount} kombinasi varian akan dibuat. Maksimal 3 opsi dan 100 kombinasi.`}
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-6">
            <section className="overflow-hidden rounded-3xl border border-border bg-surface">
              <div className="border-b border-border bg-gradient-to-br from-primary/10 to-action-end/10 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Ringkasan draft
                </p>

                <h2 className="mt-3 break-words text-lg font-semibold text-foreground">
                  {title.trim() || "Produk baru"}
                </h2>

                <p className="mt-2 break-words text-sm text-muted">
                  {storeName}
                </p>
              </div>

              <dl className="space-y-4 p-6 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">Harga dasar</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {pricePreview}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Pilihan opsi</dt>
                  <dd className="font-semibold text-foreground">
                    {options.length}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Kombinasi varian</dt>
                  <dd
                    className={`font-semibold ${
                      tooManyCombinations
                        ? "text-danger"
                        : "text-foreground"
                    }`}
                  >
                    {combinationCount}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                  <dt className="text-muted">Status awal</dt>
                  <dd className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Draft
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Setelah draft disimpan
              </h2>

              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
                <li>Unggah foto produk.</li>
                <li>Hubungkan foto dengan pilihan varian.</li>
                <li>Atur harga dan stok setiap varian.</li>
              </ol>

              <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted">
                Draft belum tampil di katalog publik.
              </p>
            </section>
          </aside>
        </div>

        <footer className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted">
            Gambar dan stok diatur setelah produk berhasil dibuat.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/seller/stores/${storeId}/products`)
              }
            >
              Batal
            </Button>

            <Button
              type="submit"
              loading={pending}
              disabled={
                tooManyCombinations || categories.length === 0
              }
              icon={<Icon name="save" />}
            >
              Simpan draft
            </Button>
          </div>
        </footer>
      </fieldset>
    </form>
  );
}