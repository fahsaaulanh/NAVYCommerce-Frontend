export default function Loading() {
  return <div role="status" aria-label="Memuat alamat asal pengiriman" className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <span className="sr-only">Memuat alamat asal pengiriman…</span>
    <div className="h-24 rounded-2xl bg-surface motion-safe:animate-pulse" />
    <div className="h-96 rounded-2xl border border-border bg-surface motion-safe:animate-pulse" />
  </div>;
}
