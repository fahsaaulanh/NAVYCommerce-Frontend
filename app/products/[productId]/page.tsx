import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackendApiError } from "@/lib/api/server";
import { catalogApi } from "@/features/products/api/catalog-api";
import PublicProductDetail from "@/features/products/components/catalog/PublicProductDetail";
import type { PublicProductDetailResponse } from "@/features/products/types/public-types";

export const metadata: Metadata = {
  title: "Detail Produk | NAVYCommerce",
};

type PageProps = {
  params: Promise<{ productId: string }>;
};

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PublicProductPage({
  params,
}: PageProps) {
  const { productId } = await params;

  if (!guidPattern.test(productId)) {
    notFound();
  }

  let result: PublicProductDetailResponse;

  try {
    result = await catalogApi.getProduct(productId);
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    if (error.status === 404) {
      notFound();
    }

    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Produk belum dapat dimuat
          </h1>

          <p
            role="alert"
            className="mt-3 text-sm leading-6 text-muted"
          >
            {error.message}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/products/${productId}`}
              className="action-button action-button--primary"
            >
              Coba kembali
            </a>

            <Link
              href="/products"
              className="action-button action-button--outline"
            >
              Kembali ke katalog
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <PublicProductDetail
      key={result.data.product.id}
      detail={result.data}
    />
  );
}