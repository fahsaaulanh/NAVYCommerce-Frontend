import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";

import LogoutButton from "@/features/auth/LogoutButton";
import { categoryApi } from "@/features/categories/category-api";
import type { CategoryListResponse } from "@/features/categories/types";

import CreateProductForm from "@/features/products/components/seller/CreateProductForm";
import { storeApi } from "@/features/stores/store-api";
import type { StoreDetailResponse } from "@/features/stores/types";

export const metadata: Metadata = {
  title: "Tambah Produk | NAVYCommerce",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function LoadingError({
  message,
  storeId,
  unauthorized,
}: {
  message: string;
  storeId: string;
  unauthorized: boolean;
}) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Form produk belum dapat dimuat
        </h1>

        <p role="alert" className="mt-3 text-sm leading-6 text-muted">
          {message}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {unauthorized ? (
            <LogoutButton />
          ) : (
            <a
              href={`/seller/stores/${storeId}/products/new`}
              className="action-button action-button--secondary"
            >
              Coba kembali
            </a>
          )}

          <Link
            href={`/seller/stores/${storeId}/products`}
            className="action-button action-button--outline"
          >
            Kembali ke produk
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function CreateProductPage({
  params,
}: PageProps) {
  await requireRole(["Seller"]);

  const { id: storeId } = await params;

  if (!guidPattern.test(storeId)) {
    notFound();
  }

  let storeResult: StoreDetailResponse;

  try {
    storeResult = await storeApi.getById(storeId);
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    if (error.status === 404) {
      notFound();
    }

    return (
      <LoadingError
        storeId={storeId}
        message={error.message}
        unauthorized={error.status === 401}
      />
    );
  }

  let categories: CategoryListResponse;

  try {
    categories = await categoryApi.getAll();
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    return (
      <LoadingError
        storeId={storeId}
        message={`Daftar kategori belum dapat dimuat. ${error.message}`}
        unauthorized={error.status === 401}
      />
    );
  }

  const store = storeResult.data;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        <Link
          href="/seller/stores"
          className="transition-colors hover:text-primary"
        >
          Toko saya
        </Link>

        <span aria-hidden="true">/</span>

        <Link
          href={`/seller/stores/${store.id}`}
          className="break-words transition-colors hover:text-primary"
        >
          {store.name}
        </Link>

        <span aria-hidden="true">/</span>

        <Link
          href={`/seller/stores/${store.id}/products`}
          className="transition-colors hover:text-primary"
        >
          Produk
        </Link>

        <span aria-hidden="true">/</span>

        <span aria-current="page" className="text-foreground">
          Tambah produk
        </span>
      </nav>

      <header className="mb-8 mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Katalog toko
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Tambah produk
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Mulai dengan informasi dasar dan pilihan varian. Setelah
          draft disimpan, lengkapi foto dan persediaan produk.
        </p>
      </header>

      <CreateProductForm
        storeId={store.id}
        storeName={store.name}
        categories={categories}
      />
    </section>
  );
}