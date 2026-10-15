"use client";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import type { CatalogCategory } from "../../../../../frontend/features/products/types/public-types";
import type { CatalogQuery } from "../../utils/catalog-query";
import { catalogHref } from "../../utils/catalog-query";
import { formatNumber } from "@/lib/format";
import styles from "./catalog.module.css";
type Props = {
  query: CatalogQuery;
  categories: CatalogCategory[];
  onApplied?: () => void;
};
export default function CatalogFilters({
  query,
  categories,
  onApplied,
}: Props) {
  const id = useId();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const min = String(data.get("minPrice") ?? "");
    const max = String(data.get("maxPrice") ?? "");
    if (min && max && Number(min) > Number(max)) {
      event.preventDefault();
      setError("Harga minimum tidak boleh melebihi harga maksimum.");
      return;
    }
    setError("");
    onApplied?.();
  }
  return (
    <form
      action="/products"
      method="get"
      onSubmit={submit}
      onChange={() => setError("")}
    >
      <div className={styles.sidebarHeading}>
        <span>Filter produk</span>
        <Link
          href={catalogHref(query, {
            page: 1,
            categoryId: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            inStock: false,
          })}
        >
          Reset
        </Link>
      </div>
      {query.q && <input type="hidden" name="q" value={query.q} />}
      <input type="hidden" name="sort" value={query.sort} />
      <fieldset className={styles.filterFieldset}>
        <legend>Kategori</legend>
        <div className={styles.categoryList}>
          <label className={styles.choice}>
            <input
              type="radio"
              name="categoryId"
              value=""
              defaultChecked={!query.categoryId}
            />
            <span className={styles.choiceText}>Semua kategori</span>
          </label>
          {query.categoryId &&
            !categories.some((item) => item.id === query.categoryId) && (
              <label className={styles.choice}>
                <input
                  type="radio"
                  name="categoryId"
                  value={query.categoryId}
                  defaultChecked
                />
                <span>Kategori {query.categoryId}</span>
              </label>
            )}
          {categories.map((category) => (
            <label key={category.id} className={styles.choice}>
              <input
                type="radio"
                name="categoryId"
                value={category.id}
                defaultChecked={query.categoryId === category.id}
              />
              <span className={styles.choiceText}>{category.name}</span>
              <span className={styles.categoryCount}>
                {formatNumber(category.productCount)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.filterFieldset}>
        <legend>Rentang harga</legend>
        <label className={styles.priceLabel} htmlFor={`${id}-min`}>
          Harga minimum
        </label>
        <div className={styles.priceField}>
          <span>Rp</span>
          <input
            id={`${id}-min`}
            name="minPrice"
            type="number"
            inputMode="decimal"
            min="0"
            max="999999999999.99"
            step="0.01"
            defaultValue={query.minPrice}
            placeholder="Minimum"
          />
        </div>
        <label className={styles.priceLabel} htmlFor={`${id}-max`}>
          Harga maksimum
        </label>
        <div className={styles.priceField}>
          <span>Rp</span>
          <input
            id={`${id}-max`}
            name="maxPrice"
            type="number"
            inputMode="decimal"
            min="0"
            max="999999999999.99"
            step="0.01"
            defaultValue={query.maxPrice}
            placeholder="Maksimum"
          />
        </div>
      </fieldset>
      <fieldset className={styles.filterFieldset}>
        <legend>Ketersediaan</legend>
        <label className={styles.choice}>
          <input
            name="inStock"
            type="checkbox"
            value="true"
            defaultChecked={query.inStock}
          />
          <span>Hanya produk dengan stok</span>
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="mb-4 text-xs leading-5 text-danger">
          {error}
        </p>
      )}
      <Button type="submit" size="sm" className={styles.filterApply}>
        Terapkan filter
      </Button>
    </form>
  );
}
