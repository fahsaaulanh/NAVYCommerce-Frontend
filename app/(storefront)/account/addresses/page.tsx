import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import Icon from "@/components/ui/Icon";
import { addressApi } from "@/features/addresses/api/address-api";
import AddressBook from "@/features/addresses/components/AddressBook";
import AddressPageShell from "@/features/addresses/components/AddressPageShell";
import AddressLoadError from "@/features/addresses/components/AddressLoadError";

export const metadata: Metadata = { title: "Alamat Pengiriman | NAVYCommerce" };

export default async function AddressesPage({ searchParams }: { searchParams: Promise<{ notice?: string | string[] }> }) {
  await requireRole(["Customer"]);
  const query = await searchParams;
  const notice = query.notice === "created" ? "Alamat berhasil ditambahkan."
    : query.notice === "updated" ? "Alamat berhasil diperbarui." : undefined;
  let content;
  try {
    const result = await addressApi.getMine();
    content = <AddressBook addresses={result.data} notice={notice} />;
  } catch (error) {
    if (!(error instanceof BackendApiError)) throw error;
    content = <AddressLoadError status={error.status} message={error.message} retryHref="/account/addresses" />;
  }
  return <AddressPageShell title="Alamat pengiriman" description="Kelola tujuan pengiriman untuk setiap pesananmu."
    action={<Link href="/account/addresses/new" className="action-button action-button--primary"><Icon name="plus" />Tambah alamat</Link>}>
    {content}
  </AddressPageShell>;
}
