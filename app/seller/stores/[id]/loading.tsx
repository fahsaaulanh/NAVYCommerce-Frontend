import Skeleton from "@/components/ui/Skeleton";

export default function StoreDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p role="status" className="sr-only">
        Memuat detail toko…
      </p>

      <div aria-hidden="true">
        <Skeleton className="mb-6 h-5 w-44" />

        <div className="overflow-hidden rounded-3xl border border-border bg-surface">
          <Skeleton className="h-28 rounded-none sm:h-36" />

          <div className="relative px-5 pb-7 sm:px-8">
            <div className="-mt-9 mb-5 inline-flex rounded-3xl border-4 border-surface">
              <Skeleton className="size-18 rounded-[1.25rem]" />
            </div>

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="w-full max-w-sm space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              <Skeleton className="h-12 w-full shrink-0 sm:w-40" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:col-span-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-3 h-4 w-2/3" />

            <div className="mt-7 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="self-start rounded-3xl border border-border bg-surface p-6">
            <Skeleton className="h-6 w-40" />

            <div className="mt-5 divide-y divide-border">
              {[0, 1, 2].map((item) => (
                <div key={item} className="space-y-2 py-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}