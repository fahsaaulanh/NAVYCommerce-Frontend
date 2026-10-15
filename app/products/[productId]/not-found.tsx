import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Produk tidak tersedia
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Produk mungkin telah dinonaktifkan atau alamat yang
          kamu buka tidak sesuai.
        </p>

        <Link
          href="/products"
          className="action-button action-button--primary mt-6"
        >
          Jelajahi produk
        </Link>
      </div>
    </section>
  );
}