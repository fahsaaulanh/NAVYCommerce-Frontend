import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { BackendApiError } from "@/lib/api/server";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  catalogApi,
  getCatalogCategories,
} from "@/features/products/api/catalog-api";
import {
  readCatalogQuery,
  catalogHref,
  paginationItems,
  type CatalogSearchParams,
} from "@/features/products/utils/catalog-query";
import PublicProductCard from "@/features/products/components/catalog/PublicProductCard";
import CatalogFilters from "@/features/products/components/catalog/CatalogFilters";
import CatalogToolbar from "@/features/products/components/catalog/CatalogToolbar";
import styles from "@/features/products/components/catalog/catalog.module.css";
export const metadata: Metadata = {
  title: "Belanja Produk | NAVYCommerce",
  description:
    "Jelajahi produk berbagai toko. Cari berdasarkan kategori, harga, dan ketersediaan stok.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {

  const query = readCatalogQuery(await searchParams);
  const [productsResult, categoriesResult] = await Promise.allSettled([
    catalogApi.getProducts(query),
    getCatalogCategories(),
  ]);

  if (productsResult.status === "rejected") {

    const error = productsResult.reason;
    if (!(error instanceof BackendApiError)) throw error;
    return (
      <section className={styles.page}>
        <div className={styles.empty}>
          <Icon name="box" className="size-10 text-muted" />
          <h1 className="text-xl font-semibold">Katalog belum dapat dimuat</h1>
          <p role="alert">{error.message}</p>
          <a
            href={catalogHref(query)}
            className="action-button action-button--primary"
          >
            Coba kembali
          </a>
          <Link href="/products" className="text-sm text-primary">
            Hapus pencarian dan filter
          </Link>
        </div>
      </section>
    );
  }

  const result = productsResult.value;
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const lastPage = Math.max(1, result.totalPages);
  if (query.page > lastPage) redirect(catalogHref(query, { page: lastPage }));
  const first = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const last = result.total ? first + result.data.length - 1 : 0;
  const activeCategory = categories.find(
    (item) => item.id === query.categoryId,
  );
  const chips: { label: string; href: string }[] = [];

  if (query.q)
    chips.push({
      label: `Pencarian: ${query.q}`,
      href: catalogHref(query, { page: 1, q: "" }),
    });

  if (query.categoryId)
    chips.push({
      label: activeCategory?.name ?? `Kategori ${query.categoryId}`,
      href: catalogHref(query, { page: 1, categoryId: undefined }),
    });

  if (query.minPrice !== undefined)
    chips.push({
      label: `Dari ${formatCurrency(Number(query.minPrice))}`,
      href: catalogHref(query, { page: 1, minPrice: undefined }),
    });

  if (query.maxPrice !== undefined)
    chips.push({
      label: `Hingga ${formatCurrency(Number(query.maxPrice))}`,
      href: catalogHref(query, { page: 1, maxPrice: undefined }),
    });

  if (query.inStock)
    chips.push({
      label: "Stok tersedia",
      href: catalogHref(query, { page: 1, inStock: false }),
    });

  return (

    <section className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Beranda</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">
          {activeCategory?.name ?? "Semua produk"}
        </span>
      </nav>
      {/* <header className={styles.heading}>
        <div>
          <div className={styles.eyebrow}>Temukan pilihanmu</div>
          <h1>
            {query.q
              ? `Hasil untuk “${query.q}”`
              : (activeCategory?.name ?? "Jelajahi produk")}
          </h1>
          <p>
            Pilihan dari berbagai toko, untuk kebutuhan dan hal-hal yang kamu
            sukai.
          </p>
        </div>
        <span className={styles.headingCount}>
          {formatNumber(result.total)} produk ditemukan
        </span>
      </header> */}
      <div className={styles.layout}>
        <aside aria-label="Filter katalog" className={styles.sidebar}>
          <CatalogFilters
            key={catalogHref(query)}
            query={query}
            categories={categories}
          />
          {categoriesResult.status === "rejected" && (
            <p role="status" className="mt-4 text-xs text-muted">
              Kategori belum dapat dimuat. Filter harga dan stok tetap tersedia.
            </p>
          )}
        </aside>
        <div className={styles.results} id="catalog-controls">
          <CatalogToolbar
            query={query}
            categories={categories}
            total={result.total}
            first={first}
            last={last}
          />
          {chips.length > 0 && (
            <nav aria-label="Filter aktif" className={styles.chips}>
              {chips.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className={styles.chip}
                  aria-label={`Hapus filter ${chip.label}`}
                >
                  <span>{chip.label}</span>
                  <Icon name="close" className="size-3" />
                </Link>
              ))}
              <Link
                href="/products"
                className="px-2 text-xs font-medium text-muted hover:text-primary"
              >
                Hapus semua
              </Link>
            </nav>
          )}

          {result.data.length > 0 ? (
            <ul className={styles.grid}>
              {result.data.map((product) => (
                <li key={product.id} className="min-w-0">
                  <PublicProductCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              <Icon name="search" className="size-10 text-muted" />
              <h2>
                {chips.length
                  ? "Belum menemukan yang sesuai"
                  : "Katalog segera hadir"}
              </h2>
              <p>
                {chips.length
                  ? "Coba kata kunci lain atau perluas rentang harga dan kategori."
                  : "Produk akan tampil setelah dipublikasikan oleh pemilik toko."}
              </p>
              {chips.length > 0 && (
                <Link
                  href="/products"
                  className="action-button action-button--outline"
                >
                  Lihat semua produk
                </Link>
              )}
            </div>
          )}

          {result.totalPages > 1 && (
            <nav aria-label="Pagination katalog" className={styles.pagination}>
              <p>
                Halaman {formatNumber(result.page)} dari{" "}
                {formatNumber(result.totalPages)}
              </p>
              <div className={styles.pages}>
                {query.page > 1 && (
                  <Link
                    href={catalogHref(query, { page: query.page - 1 })}
                    className={styles.pageLink}
                    aria-label="Halaman sebelumnya"
                  >
                    <Icon name="arrow-left" className="size-4" />
                  </Link>
                )}
                {paginationItems(query.page, result.totalPages).map(
                  (page, index) =>
                    page === null ? (
                      <span key={`gap-${index}`} className="px-1">
                        …
                      </span>
                    ) : (
                      <Link
                        key={page}
                        href={catalogHref(query, { page })}
                        className={styles.pageLink}
                        aria-label={`Halaman ${page}`}
                        aria-current={page === query.page ? "page" : undefined}
                      >
                        {page}
                      </Link>
                    ),
                )}
                {query.page < result.totalPages && (
                  <Link
                    href={catalogHref(query, { page: query.page + 1 })}
                    className={styles.pageLink}
                    aria-label="Halaman berikutnya"
                  >
                    <Icon name="arrow-right" className="size-4" />
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
