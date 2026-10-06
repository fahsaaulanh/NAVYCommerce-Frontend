import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import LogoutButton from "@/features/auth/LogoutButton";
import { storeApi } from "@/features/stores/store-api";
import type { StoreDetailResponse } from "@/features/stores/types";

export const metadata: Metadata = {
  title: "Detail Toko | NAVYCommerce",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function StoreDetailPage({
  params,
}: PageProps) {
  await requireRole(["Seller"]);

  const { id } = await params;

  if (!guidPattern.test(id)) {
    notFound();
  }

  let result: StoreDetailResponse;

  try {
    result = await storeApi.getById(id);
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    if (error.status === 404) {
      notFound();
    }

    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Detail toko belum dapat dimuat
          </h1>

          <p role="alert" className="mt-3 text-sm leading-6 text-muted">
            {error.message}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {error.status === 401 ? (
              <LogoutButton />
            ) : (
              <Link
                href={`/seller/stores/${id}`}
                className="action-button"
              >
                Coba kembali
              </Link>
            )}

            <Link
              href="/seller/stores"
              className="rounded-xl px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Kembali ke daftar toko
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const store = result.data;

  const createdAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date(store.createdAt));

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/seller/stores"
        className="inline-flex rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        ← Daftar toko
      </Link>

      <header className="mt-6 rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            aria-hidden="true"
            className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-action-start to-action-end text-3xl font-semibold text-on-primary"
          >
            {Array.from(store.name)[0]?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Toko milikmu
            </p>

            <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-foreground">
              {store.name}
            </h1>

            <p className="mt-2 break-all text-sm text-muted">
              /{store.slug}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            Tentang toko
          </h2>

          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-muted">
            {store.description || "Belum ada deskripsi toko."}
          </p>
        </article>

        <aside className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">
            Informasi toko
          </h2>

          <dl className="mt-5 space-y-5 text-sm">
            <div>
              <dt className="text-muted">Slug</dt>
              <dd className="mt-1 break-all font-medium text-foreground">
                {store.slug}
              </dd>
            </div>

            <div className="border-t border-border pt-5">
              <dt className="text-muted">Tanggal dibuat</dt>
              <dd className="mt-1 font-medium text-foreground">
                <time dateTime={store.createdAt}>
                  {createdAt}
                </time>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}