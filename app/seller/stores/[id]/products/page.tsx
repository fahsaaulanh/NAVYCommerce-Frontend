import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import LogoutButton from "@/features/auth/LogoutButton";
import { storeApi } from "@/features/stores/store-api";
import { productApi } from "@/features/products/product-api";
import SellerProductCard from "@/features/products/SellerProductCard";
import ProductIcon from "@/features/products/ProductIcon";

export const metadata: Metadata = {
  title: "Produk Toko | NAVYCommerce",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function StoreProductsPage({
  params,
  searchParams,
}: PageProps) {
  await requireRole(["Seller"]);

  const { id: storeId } = await params;
  const query = await searchParams;

  if (!guidPattern.test(storeId)) {
    notFound();
  }

  const parsedPage =
    typeof query.page === "string" && /^\d+$/.test(query.page)
      ? Number(query.page)
      : 1;

  const page =
    Number.isSafeInteger(parsedPage) &&
      parsedPage >= 1 &&
      parsedPage <= 1_000_000
      ? parsedPage
      : 1;

  let responses: [
    Awaited<ReturnType<typeof storeApi.getById>>,
    Awaited<ReturnType<typeof productApi.getOwnedByStore>>,
  ];

  try {
    responses = await Promise.all([
      storeApi.getById(storeId),
      productApi.getOwnedByStore(storeId, page, 12),
    ]);
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    if (error.status === 404) {
      notFound();
    }

    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Daftar produk belum dapat dimuat
          </h1>

          <p role="alert" className="mt-3 text-sm leading-6 text-muted">
            {error.message}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {error.status === 401 ? (
              <LogoutButton />
            ) : (
              <a
                href={`/seller/stores/${storeId}/products?page=${page}`}
                className="action-button"
              >
                Coba kembali
              </a>
            )}

            <Link
              href={`/seller/stores/${storeId}`}
              className="action-button action-button--outline"
            >
              Kembali ke toko
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const [storeResult, productsResult] = responses;

  const store = storeResult.data;
  const { data: products, pagination } = productsResult;

  const lastPage = Math.max(1, pagination.totalPages);

  if (page > lastPage) {
    redirect(
      `/seller/stores/${storeId}/products?page=${lastPage}`,
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        <Link href="/seller/stores" className="hover:text-primary">
          Toko saya
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/seller/stores/${storeId}`}
          className="hover:text-primary"
        >
          {store.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-foreground">
          Produk
        </span>
      </nav>

      <header className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Katalog toko
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Produk {store.name}
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              Kelola gambar, pilihan, harga, dan persediaan produk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/seller/stores/${storeId}`}
              className="action-button action-button--outline"
            >
              <ProductIcon name="back" className="size-4" />
              Detail toko
            </Link>

            <Link
              href={`/seller/stores/${storeId}/products/new`}
              className="action-button action-button--primary"
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>

              Tambah produk
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm">
          <p className="text-muted">
            <span className="font-semibold text-foreground">
              {pagination.total}
            </span>{" "}
            produk tercatat
          </p>

          <p className="text-xs text-muted">
            Draft dan produk aktif
          </p>
        </div>
      </header>

      {products.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ProductIcon name="box" className="size-8" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-foreground">
            Belum ada produk
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            Produk yang tersimpan untuk toko ini akan ditampilkan
            di sini, termasuk produk yang masih Draft.
          </p>
        </section>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <SellerProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      {pagination.totalPages > 1 && (
        <nav
          aria-label="Pagination produk"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4"
        >
          <p className="text-sm text-muted">
            Halaman {page} dari {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/seller/stores/${storeId}/products?page=${page - 1}`}
                className="action-button action-button--outline action-button--sm"
              >
                Sebelumnya
              </Link>
            )}

            {page < pagination.totalPages && (
              <Link
                href={`/seller/stores/${storeId}/products?page=${page + 1}`}
                className="action-button action-button--secondary action-button--sm"
              >
                Berikutnya
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}