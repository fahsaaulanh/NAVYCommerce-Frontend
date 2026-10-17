import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import Icon from "@/components/ui/Icon";

import { addressApi } from "@/features/addresses/api/address-api";
import type { CustomerAddress } from "@/features/addresses/types/address";
import AddressBook from "@/features/addresses/components/AddressBook";
import AddressPageShell from "@/features/addresses/components/AddressPageShell";
import AddressLoadError from "@/features/addresses/components/AddressLoadError";

export const metadata: Metadata = {
  title: "Alamat Pengiriman | NAVYCommerce",
};

type PageProps = {
  searchParams: Promise<{
    notice?: string | string[];
  }>;
};

export default async function AddressesPage({
  searchParams,
}: PageProps) {
  await requireRole(["Customer"]);

  const query = await searchParams;

  const notice =
    query.notice === "created"
      ? "Alamat berhasil ditambahkan."
      : query.notice === "updated"
        ? "Alamat berhasil diperbarui."
        : undefined;

  let addresses: CustomerAddress[] = [];
  let loadError: BackendApiError | null = null;

  try {
    const response = await addressApi.getMine();
    addresses = response.data;
  } catch (error) {
    if (!(error instanceof BackendApiError)) {
      throw error;
    }

    loadError = error;
  }

  return (
    <AddressPageShell
      title="Alamat pengiriman"
      description="Kelola tujuan pengiriman untuk setiap pesananmu."
      action={
        <Link
          href="/account/addresses/new"
          className="action-button action-button--primary"
        >
          <Icon name="plus" />
          Tambah alamat
        </Link>
      }
    >
      {loadError ? (
        <AddressLoadError
          status={loadError.status}
          message={loadError.message}
          retryHref="/account/addresses"
        />
      ) : (
        <AddressBook addresses={addresses} notice={notice} />
      )}
    </AddressPageShell>
  );
}