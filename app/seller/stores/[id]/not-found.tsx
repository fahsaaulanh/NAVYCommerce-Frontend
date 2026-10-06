import Link from "next/link";

export default function StoreNotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          Toko tidak ditemukan
        </p>

        <h1 className="mt-3 text-2xl font-semibold text-foreground">
          Toko ini tidak tersedia untuk akunmu
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Periksa alamatnya atau pilih toko dari daftar milikmu.
        </p>

        <Link
          href="/seller/stores"
          className="action-button mt-6"
        >
          Kembali ke daftar toko
        </Link>
      </div>
    </section>
  );
}