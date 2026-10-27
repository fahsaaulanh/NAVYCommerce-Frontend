import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import { addressApi } from "@/features/addresses/api/address-api";
import { isAddressId } from "@/features/addresses/utils/validation";
import { safeReturnTo } from "@/lib/navigation";
import AddressForm from "@/features/addresses/components/AddressForm";
import AddressPageShell from "@/features/addresses/components/AddressPageShell";
import AddressLoadError from "@/features/addresses/components/AddressLoadError";

export const metadata: Metadata = { title: "Ubah Alamat | NAVYCommerce" };
export default async function EditAddressPage({ params, searchParams }: { params: Promise<{ addressId: string }>; searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const user = await requireRole(["Customer"]);
  const { addressId } = await params;
  const returnTo = safeReturnTo((await searchParams).returnTo, ["/checkout"]);
  if (!isAddressId(addressId)) notFound();
  const loaded = await addressApi.getMine().then(result => ({ result,error:null }))
    .catch((error:unknown) => {
      if (!(error instanceof BackendApiError)) throw error;
      return { result:null,error };
    });
  if (loaded.error) return <AddressPageShell title="Ubah alamat" description="Perbarui informasi penerima dan tujuan pengiriman." form>
    <AddressLoadError status={loaded.error.status} message={loaded.error.message} retryHref={`/account/addresses/${addressId}/edit`} />
  </AddressPageShell>;
  const result = loaded.result!;
  const address = result.data.find(value => value.id === addressId);
  if (!address) notFound();
  return <AddressPageShell title="Ubah alamat" description="Perbarui informasi penerima dan tujuan pengiriman." form>
    <AddressForm key={address.id} address={address} defaultRecipient={user.fullName} returnTo={returnTo} />
  </AddressPageShell>;
}
