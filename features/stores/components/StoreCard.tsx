import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { Store } from "@/features/stores/types";

type StoreCardProps = {
  store: Store;
};

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/seller/stores/${store.id}`}
      className="store-card h-full"
    >
      <span aria-hidden="true" className="store-card__decoration" />

      <div className="relative mb-5 flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-action-start to-action-end text-on-primary shadow-sm">
          <Icon name="store" className="size-6" />
        </span>

        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-foreground">
            {store.name}
          </h2>
          <p className="truncate text-sm text-muted">
            /{store.slug}
          </p>
        </div>
      </div>

      <p className="relative mb-6 line-clamp-2 min-h-10 text-sm leading-5 text-muted">
        {store.description || "Deskripsi toko belum ditambahkan."}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-xs text-muted">
          Dibuat{" "}
          {new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          }).format(new Date(store.createdAt))}
        </span>

        <span className="flex items-center gap-2 text-sm font-semibold text-primary">
          Lihat detail
          <Icon name="arrow-right" className="store-card__arrow size-4" />
        </span>
      </div>
    </Link>
  );
}