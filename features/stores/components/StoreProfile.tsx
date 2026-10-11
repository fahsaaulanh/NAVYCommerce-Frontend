import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { Store } from "@/features/stores/types";

type StoreProfileProps = {
  store: Store;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export default function StoreProfile({ store }: StoreProfileProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <li>
            <Link
              href="/seller/stores"
              className="transition-colors hover:text-primary"
            >
              Toko saya
            </Link>
          </li>

          <li aria-hidden="true">/</li>

          <li aria-current="page" className="font-medium text-foreground">
            Detail toko
          </li>
        </ol>
      </nav>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div
          aria-hidden="true"
          className="relative h-28 overflow-hidden bg-gradient-to-r from-panel via-action-start to-action-end sm:h-36"
        >
          <span className="absolute -right-8 -top-16 size-56 rounded-full border-[28px] border-white/10" />
          <span className="absolute right-36 top-12 size-32 rounded-full border-[20px] border-white/10" />
        </div>

        <div className="relative px-5 pb-7 sm:px-8">
          <div className="-mt-9 mb-5 flex size-20 items-center justify-center rounded-3xl border-4 border-surface bg-background text-primary shadow-sm">
            <Icon name="store" className="size-9" />
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                Profil toko
              </p>

              <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {store.name}
              </h1>

              <p className="mt-2 break-all text-sm text-primary">
                /{store.slug}
              </p>
            </div>

            <Link
              href="/seller/stores"
              className="action-button action-button--secondary shrink-0"
            >
              <Icon name="arrow-left" />
              Semua toko
            </Link>
          </div>

          <Link
              href={`/seller/stores/${store.id}/products`}
              className="action-button mt-5"
            >
              Kelola produk
            </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section
          aria-labelledby="store-description"
          className="rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:col-span-2"
        >
          <h2
            id="store-description"
            className="text-lg font-semibold text-foreground"
          >
            Tentang toko
          </h2>

          <p className="mt-1 text-sm text-muted">
            Informasi yang menggambarkan usaha kamu.
          </p>

          {store.description ? (
            <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
              {store.description}
            </p>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-5">
              <p className="text-sm font-medium text-foreground">
                Deskripsi belum ditambahkan
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Deskripsi membantu pelanggan mengenal toko dan produk
                yang kamu tawarkan.
              </p>
            </div>
          )}
        </section>

        <section
          aria-labelledby="store-information"
          className="self-start rounded-3xl border border-border bg-surface p-6"
        >
          <h2
            id="store-information"
            className="text-lg font-semibold text-foreground"
          >
            Informasi toko
          </h2>

          <dl className="mt-5 divide-y divide-border text-sm">
            <div className="pb-4">
              <dt className="text-muted">Nama toko</dt>
              <dd className="mt-1 break-words font-medium text-foreground">
                {store.name}
              </dd>
            </div>

            <div className="py-4">
              <dt className="text-muted">Slug toko</dt>
              <dd className="mt-1 break-all font-medium text-foreground">
                {store.slug}
              </dd>
            </div>

            <div className="pt-4">
              <dt className="text-muted">Tanggal dibuat</dt>
              <dd className="mt-1 font-medium text-foreground">
                <time dateTime={store.createdAt}>
                  {dateFormatter.format(new Date(store.createdAt))}
                </time>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  );
}