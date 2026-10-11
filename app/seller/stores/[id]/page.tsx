import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Icon from "@/components/ui/Icon";
import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import LogoutButton from "@/features/auth/LogoutButton";
import StoreProfile from "@/features/stores/components/StoreProfile";
import { storeApi } from "@/features/stores/store-api";
import type { StoreDetailResponse } from "@/features/stores/types";

export const metadata: Metadata = {
  title: "Detail Toko | NAVYCommerce",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function StoreDetailPage({ params }: PageProps) {
  await requireRole(["Seller"]);

  const { id } = await params;

  if (!guidPattern.test(id)) {
    notFound();
  }

  let result: StoreDetailResponse;

  try {
    result = await storeApi.getById(id);
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    if (error.status === 404) {
      notFound();
    }

    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <span
            aria-hidden="true"
            className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Icon name="store" className="size-7" />
          </span>

          <h1 className="text-2xl font-semibold text-foreground">
            Detail toko belum dapat dimuat
          </h1>

          <p role="alert" className="mt-3 text-sm leading-6 text-muted">
            {error.message}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {error.status === 401 ? (
              <LogoutButton />
            ) : (
              <Link
                href={`/seller/stores/${id}`}
                className="action-button action-button--primary"
              >
                <Icon name="arrow-right" />
                Coba kembali
              </Link>
            )}

            <Link
              href="/seller/stores"
              className="action-button action-button--secondary"
            >
              <Icon name="arrow-left" />
              Daftar toko
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <StoreProfile store={result.data} />;
}