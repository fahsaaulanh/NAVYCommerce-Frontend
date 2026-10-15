"use client";
import { useId } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import {
  catalogParams,
  readCatalogQuery,
} from "@/features/products/utils/catalog-query";
import styles from "./marketplace.module.css";
export default function CatalogSearch() {
  const id = useId();
  const params = useSearchParams();
  const query = readCatalogQuery(Object.fromEntries(params.entries()));
  const retained = catalogParams({ ...query, page: 1, q: "" });
  return (
    <form
      action="/products"
      method="get"
      role="search"
      className={styles.search}
    >
      <Icon name="search" className="text-muted" />
      <label htmlFor={id} className="sr-only">
        Cari produk atau nama toko
      </label>
      <input
        key={query.q}
        id={id}
        name="q"
        type="search"
        maxLength={120}
        defaultValue={query.q}
        placeholder="Cari produk atau nama toko…"
      />
      {[...retained].map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" aria-label="Cari produk">
        <Icon name="search" />
      </button>
    </form>
  );
}
