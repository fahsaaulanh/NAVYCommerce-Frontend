import styles from "@/features/products/components/catalog/catalog.module.css";
export default function ProductsLoading() {
  return (
    <section
      className={styles.page}
      aria-busy="true"
      aria-label="Memuat katalog"
    >
      <p className="sr-only">Memuat katalog produk…</p>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="mb-8 h-4 w-32 rounded bg-border/60" />
        <div className="mb-3 h-9 w-64 rounded bg-border/60" />
        <div className="mb-8 h-4 w-72 max-w-full rounded bg-border/60" />
        <div className={styles.layout}>
          <div className={`${styles.sidebar} h-96`} />
          <div>
            <div className="mb-5 h-16 rounded-xl border border-border bg-surface" />
            <div className={styles.grid}>
              {Array.from({ length: 12 }, (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <div className="aspect-square bg-border/40" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 rounded bg-border/40" />
                    <div className="h-4 w-2/3 rounded bg-border/40" />
                    <div className="h-6 w-28 rounded bg-border/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
