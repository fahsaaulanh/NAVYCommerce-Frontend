export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Memuat detail produk"
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Memuat detail produk…</span>

      <div
        aria-hidden="true"
        className="space-y-6 motion-safe:animate-pulse"
      >
        <div className="h-5 w-60 rounded bg-border/60" />

        <div className="space-y-4 rounded-3xl border border-border bg-surface p-8">
          <div className="h-4 w-28 rounded bg-border/60" />
          <div className="h-10 w-3/4 rounded bg-border/60" />
          <div className="h-4 w-44 rounded bg-border/60" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-24 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="aspect-square rounded-3xl border border-border bg-surface" />

          <div className="space-y-6">
            <div className="h-52 rounded-3xl border border-border bg-surface" />
            <div className="h-64 rounded-3xl border border-border bg-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}