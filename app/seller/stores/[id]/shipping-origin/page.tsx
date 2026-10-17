import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import LogoutButton from "@/features/auth/LogoutButton";
import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import { isGuid } from "@/lib/validation";
import { storeApi } from "@/features/stores/store-api";
import { storeShippingOriginApi } from "@/features/stores/shipping-origin/api";
import ShippingOriginForm from "@/features/stores/shipping-origin/components/ShippingOriginForm";
import styles from "@/features/stores/shipping-origin/components/shipping-origin.module.css";

export const metadata: Metadata = {
  title: "Alamat Asal Pengiriman | NAVYCommerce",
};
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function StoreShippingOriginPage({
  params,
  searchParams,
}: Props) {
  const user = await requireRole(["Seller"]);
  const { id } = await params;
  if (!isGuid(id)) notFound();
  const query = await searchParams;
  let responses:
    | [
      Awaited<ReturnType<typeof storeApi.getById>>,
      Awaited<ReturnType<typeof storeShippingOriginApi.get>>,
    ]
    | null = null;
  let loadError: BackendApiError | null = null;
  try {
    responses = await Promise.all([
      storeApi.getById(id),
      storeShippingOriginApi.get(id),
    ]);
  } catch (error) {
    if (!(error instanceof BackendApiError)) throw error;
    loadError = error;
  }
  if (loadError?.status === 404) notFound();
  const store = responses?.[0].data;
  const origin = responses?.[1].data ?? null;
  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/seller/stores">Toko saya</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/seller/stores/${id}`}>
          {store?.name ?? "Detail toko"}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Alamat pengiriman</span>
      </nav>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Pengiriman toko</p>
          <h1>Alamat asal pengiriman</h1>
          <p>
            Atur lokasi asal paket dan kontak pengirim untuk{" "}
            {store?.name ?? "toko ini"}.
          </p>
        </div>
        <Link
          href={`/seller/stores/${id}`}
          className="action-button action-button--ghost"
        >
          <Icon name="arrow-left" />
          Detail toko
        </Link>
      </header>
      {loadError ? (
        <section className={styles.errorPanel}>
          <h2>Alamat asal belum dapat dimuat</h2>
          <p role="alert">{loadError.message}</p>
          <div className={styles.errorActions}>
            {loadError.status === 401 ? (
              <LogoutButton />
            ) : (
              <a
                href={`/seller/stores/${id}/shipping-origin`}
                className="action-button action-button--secondary"
              >
                Coba kembali
              </a>
            )}
            <Link
              href="/seller/stores"
              className="action-button action-button--outline"
            >
              Daftar toko
            </Link>
          </div>
        </section>
      ) : (
        store && (
          <>
            {query.notice === "saved" && (
              <p role="status" className={styles.notice}>
                Alamat asal pengiriman berhasil disimpan.
              </p>
            )}
            <ShippingOriginForm
              key={`${id}:${origin?.updatedAt ?? "new"}`}
              store={store}
              origin={origin}
              defaultContact={user.fullName}
            />
          </>
        )
      )}
    </div>
  );
}
