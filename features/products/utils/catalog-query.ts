export const CATALOG_PAGE_SIZE = 12;
export const CATALOG_SORTS = [
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga terendah" },
  { value: "price-desc", label: "Harga tertinggi" },
  { value: "name", label: "Nama A–Z" },
] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number]["value"];
export type CatalogQuery = {
  page: number;
  q: string;
  categoryId?: number;
  minPrice?: string;
  maxPrice?: string;
  inStock: boolean;
  sort: CatalogSort;
};
export type CatalogSearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function positive(value: string, max: number) {
  const n = /^\d+$/.test(value) ? Number(value) : NaN;
  return Number.isSafeInteger(n) && n > 0 && n <= max ? n : undefined;
}

function price(value: string) {
  return /^\d+(?:\.\d{1,2})?$/.test(value) &&
    Number(value) <= 999_999_999_999.99
    ? value
    : undefined;
}

export function readCatalogQuery(params: CatalogSearchParams): CatalogQuery {
  const sort = single(params.sort);
  return {
    page: positive(single(params.page), 1_000_000) ?? 1,
    q: single(params.q).trim().slice(0, 120),
    categoryId: positive(single(params.categoryId), 2_147_483_647),
    minPrice: price(single(params.minPrice)),
    maxPrice: price(single(params.maxPrice)),
    inStock: single(params.inStock) === "true",
    sort: CATALOG_SORTS.some((item) => item.value === sort)
      ? (sort as CatalogSort)
      : "newest",
  };
}

export function catalogParams(query: CatalogQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.categoryId) params.set("categoryId", String(query.categoryId));
  if (query.minPrice !== undefined) params.set("minPrice", query.minPrice);
  if (query.maxPrice !== undefined) params.set("maxPrice", query.maxPrice);
  if (query.inStock) params.set("inStock", "true");
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export function catalogHref(
  query: CatalogQuery,
  changes: Partial<CatalogQuery> = {},
) {
  const params = catalogParams({ ...query, ...changes });
  return `/products${params.size ? `?${params.toString()}` : ""}`;
}

export function paginationItems(
  page: number,
  total: number,
): (number | null)[] {
  const pages = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((n) => n > 0 && n <= total)
    .sort((a, b) => a - b);
  const result: (number | null)[] = [];
  for (const n of pages) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && n - previous > 1) result.push(null);
    result.push(n);
  }
  return result;
}
