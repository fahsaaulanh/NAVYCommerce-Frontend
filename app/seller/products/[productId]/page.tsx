import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import LogoutButton from "@/features/auth/LogoutButton";
import { productApi } from "@/features/products/product-api";
import ProductWorkspace from "@/features/products/ProductWorkspace";

export const metadata: Metadata = {
  title: "Detail Produk | NAVYCommerce",
};

type PageProps = {
  params: Promise<{ productId: string }>;
};

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProductDetailPage({
  params,
}: PageProps) {
  await requireRole(["Seller"]);

  const { productId } = await params;

  if (!guidPattern.test(productId)) {
    notFound();
  }

  const [productResult, galleryResult] = await Promise.allSettled([
    productApi.getOwnedById(productId),
    productApi.getGallery(productId),
  ]);

  if (productResult.status === "rejected") {
    const error: unknown = productResult.reason;

    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    if (error.status === 404) {
      notFound();
    }

    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Produk belum dapat dimuat
          </h1>

          <p role="alert" className="mt-3 text-sm leading-6 text-muted">
            {error.message}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {error.status === 401 ? (
              <LogoutButton />
            ) : (
              <a
                href={`/seller/products/${productId}`}
                className="action-button"
              >
                Coba kembali
              </a>
            )}

            <Link
              href="/seller/stores"
              className="action-button action-button--outline"
            >
              Kembali ke toko saya
            </Link>
          </div>
        </div>
      </section>
    );
  }

  let galleryError: string | undefined;

  if (galleryResult.status === "rejected") {
    const error: unknown = galleryResult.reason;

    galleryError =
      error instanceof BackendApiError
        ? error.message
        : "Galeri gambar belum dapat dimuat.";
  }

  return (
    <ProductWorkspace
      product={productResult.value.data}
      images={
        galleryResult.status === "fulfilled"
          ? galleryResult.value.data
          : []
      }
      galleryError={galleryError}
    />
  );
}