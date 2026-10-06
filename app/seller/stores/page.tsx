import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import LogoutButton from "@/features/auth/LogoutButton";
import { storeApi } from "@/features/stores/store-api";
import type { StoreListResponse } from "@/features/stores/types";

export const metadata: Metadata = {
  title: "Toko Saya | NAVYCommerce",
};

type PageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function StoresPage({ searchParams }: PageProps) {
  await requireRole(["Seller"]);

  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;

  const page = rawPage === undefined ? 1 : Number(rawPage);

  if (!Number.isSafeInteger(page) || page < 1 || page > 1_000_000) {
    redirect("/seller/stores");
  }

  let result: StoreListResponse;

  try {
    result = await storeApi.getMine(page, 20);
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Toko belum dapat dimuat
          </h1>

          <p role="alert" className="mt-3 text-sm leading-6 text-muted">
            {error.message}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {error.status === 401 ? (
              <LogoutButton />
            ) : (
              <Link
                href={`/seller/stores?page=${page}`}
                className="action-button"
              >
                Coba kembali
              </Link>
            )}

            <Link
              href="/account"
              className="rounded-xl px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Kembali ke akun
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (result.total === 0 && page > 1) {
    redirect("/seller/stores");
  }

  if (result.totalPages > 0 && page > result.totalPages) {
    redirect(`/seller/stores?page=${result.totalPages}`);
  }

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  });

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <Link href="/seller/stores/new" className="action-button">
          Buat toko
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Ruang seller
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Toko Saya
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Daftar toko yang terhubung dengan akunmu.
          </p>
        </div>

        <Link
          href="/account"
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Kembali ke akun
        </Link>
      </header>

      <div className="mt-8 rounded-2xl border border-border bg-surface px-5 py-4">
        <p className="text-sm text-muted">
          Total toko{" "}
          <span className="ml-2 font-semibold text-foreground">
            {result.total}
          </span>
        </p>
      </div>

      {result.total === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center">
          <div
            aria-hidden="true"
            className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10h18l-2-6H5l-2 6Z" />
              <path d="M5 10v10h14V10M9 20v-6h6v6" />
            </svg>
          </div>

          <h2 className="mt-5 text-xl font-semibold text-foreground">
            Belum ada toko
          </h2>

          <Link href="/seller/stores/new" className="action-button mt-6">
            Buat toko pertama
          </Link>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            Toko yang kamu buat akan tampil di halaman ini.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {result.data.map((store) => (
            <li
              key={store.id}
              className="flex flex-col rounded-3xl border border-border bg-surface p-6"
            >
              <div
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary"
              >
                {Array.from(store.name)[0]?.toUpperCase()}
              </div>

              <h2 className="mt-5 break-words text-lg font-semibold text-foreground">
                {store.name}
              </h2>

              <p className="mt-1 break-all text-sm text-primary">
                /{store.slug}
              </p>

              <p className="mt-4 text-sm leading-6 text-muted">
                {store.description || "Belum ada deskripsi toko."}
              </p>

              <div className="mt-auto pt-6">
                <p className="border-t border-border pt-4 text-xs text-muted">
                  Dibuat{" "}
                  <time dateTime={store.createdAt}>
                    {dateFormatter.format(new Date(store.createdAt))}
                  </time>
                </p>

                <Link
                  href={`/seller/stores/${store.id}`}
                  className="action-button mt-5 w-full"
                >
                  Lihat detail toko
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {result.totalPages > 1 && (
        <nav
          aria-label="Halaman daftar toko"
          className="mt-8 flex flex-wrap items-center justify-between gap-4"
        >
          <p className="text-sm text-muted">
            Halaman {result.page} dari {result.totalPages}
          </p>

          <div className="flex gap-3">
            {result.page > 1 && (
              <Link
                href={`/seller/stores?page=${result.page - 1}`}
                className="action-button"
              >
                Sebelumnya
              </Link>
            )}

            {result.page < result.totalPages && (
              <Link
                href={`/seller/stores?page=${result.page + 1}`}
                className="action-button"
              >
                Berikutnya
              </Link>
            )}
          </div>
        </nav>
      )}
    </section>
  );
}
