import Skeleton from "@/components/ui/Skeleton";

export default function StoreListLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p role="status" className="sr-only">
        Memuat daftar toko…
      </p>

      <div aria-hidden="true">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="w-full max-w-sm space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>

          <Skeleton className="h-12 w-full shrink-0 sm:w-40" />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="flex flex-col rounded-3xl border border-border bg-surface p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="size-12 shrink-0 rounded-2xl" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>

              <div className="mb-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}