import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { safeReturnTo } from "@/lib/navigation";
import AddressForm from "@/features/addresses/components/AddressForm";
import AddressPageShell from "@/features/addresses/components/AddressPageShell";

export const metadata: Metadata = { title: "Tambah Alamat | NAVYCommerce" };
export default async function NewAddressPage({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const user = await requireRole(["Customer"]);
  const returnTo = safeReturnTo((await searchParams).returnTo, ["/checkout"]);
  return <AddressPageShell title="Tambah alamat" description="Lengkapi penerima dan tujuan pengirimanmu." form>
    <AddressForm defaultRecipient={user.fullName} returnTo={returnTo} />
  </AddressPageShell>;
}
