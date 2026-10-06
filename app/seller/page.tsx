import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { storeApi } from "@/features/stores/store-api";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Seller Center | NAVYCommerce",
};

export default async function SellerDashboardPage() {
  const user = await requireRole(["Seller"]);
  const stores = await storeApi.getMine(1, 4);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Ringkasan usaha
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Selamat datang, {user.fullName}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Akses toko dan siapkan informasi usahamu dari satu tempat.
          </p>
        </div>

        <Link
          href="/seller/stores/new"
          className="action-button"
        >
          <Icon name="store"/>
          Buat toko
        </Link>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_2fr]">
        <article className="rounded-3xl border border-border bg-surface p-6">
          <p className="text-sm font-medium text-muted">
            Total toko
          </p>

          <p className="mt-4 text-4xl font-semibold tracking-tight">
            {stores.total}
          </p>

          <Link
            href="/seller/stores"
            className="mt-6 inline-block rounded-lg py-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Lihat daftar toko →
          </Link>
        </article>

        <article className="rounded-3xl bg-panel p-6 text-on-panel sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-panel-muted">
            Fondasi usahamu
          </p>

          <h2 className="mt-3 text-2xl font-semibold">
            Bangun identitas toko yang mudah dikenali
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-panel-muted">
            Gunakan nama yang jelas, slug yang mudah diingat,
            dan deskripsi yang menjelaskan karakter tokomu.
          </p>

          <Link
            href="/seller/stores/new"
            className="action-button mt-6"
          >
            <Icon name="plus"/>
            Tambahkan toko
            <Icon name="store"/>
          </Link>
        </article>
      </div>

      <section
        aria-labelledby="recent-stores-title"
        className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <h2
            id="recent-stores-title"
            className="text-lg font-semibold"
          >
            Toko terbaru
          </h2>

          <Link
            href="/seller/stores"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Lihat semua
          </Link>
        </div>

        {stores.data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="text-lg font-semibold">
              Mulai dengan toko pertamamu
            </h3>

            <p className="mt-3 text-sm leading-6 text-muted">
              Setelah dibuat, toko akan tampil di dashboard ini.
            </p>

            <Link
              href="/seller/stores/new"
              className="action-button mt-6"
            >
              <Icon name="store"/>
              Buat toko pertama
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {stores.data.map(store => (
              <li key={store.id}>
                <Link
                  href={`/seller/stores/${store.id}`}
                  className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-background"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary"
                  >
                    {Array.from(store.name)[0]?.toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {store.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted">
                      /{store.slug}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="text-primary"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}