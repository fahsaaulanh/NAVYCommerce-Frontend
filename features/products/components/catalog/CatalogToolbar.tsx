"use client";
import { useId, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatNumber } from "@/lib/format";
import type { CatalogCategory } from "@/features/products/types/public-types";
import {
  CATALOG_SORTS,
  catalogHref,
  type CatalogQuery,
  type CatalogSort,
} from "../../utils/catalog-query";
import CatalogFilters from "./CatalogFilters";
import styles from "./catalog.module.css";
type Props = {
  query: CatalogQuery;
  categories: CatalogCategory[];
  total: number;
  first: number;
  last: number;
};
export default function CatalogToolbar({
  query,
  categories,
  total,
  first,
  last,
}: Props) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <>
      <div className={styles.toolbar} aria-busy={pending}>
        <p className={styles.resultCount} aria-live="polite">
          {total > 0 ? (
            <>
              <strong>
                {formatNumber(first)}–{formatNumber(last)}
              </strong>{" "}
              dari <strong>{formatNumber(total)}</strong> produk
            </>
          ) : (
            "Tidak ada produk yang sesuai"
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          icon={<Icon name="filter" />}
          className={styles.mobileFilter}
          onClick={() => dialog.current?.showModal()}
        >
          Filter
        </Button>
        <div className={styles.sort}>
          <label htmlFor={id}>Urutkan</label>
          <select
            id={id}
            value={query.sort}
            disabled={pending}
            onChange={(event) => {
              const sort = event.target.value as CatalogSort;
              startTransition(() =>
                router.push(catalogHref(query, { page: 1, sort })),
              );
            }}
          >
            {CATALOG_SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {pending && (
          <span className="sr-only" role="status">
            Memperbarui katalog…
          </span>
        )}
      </div>
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-heading`}
        className={styles.dialog}
      >
        <div className={styles.dialogHeader}>
          <h2 id={`${id}-heading`}>Sesuaikan pencarian</h2>
          <Button
            variant="ghost"
            size="icon"
            autoFocus
            icon={<Icon name="close" />}
            onClick={() => dialog.current?.close()}
          >
            Tutup filter
          </Button>
        </div>
        <CatalogFilters
          key={catalogHref(query)}
          query={query}
          categories={categories}
          onApplied={() => dialog.current?.close()}
        />
      </dialog>
    </>
  );
}
