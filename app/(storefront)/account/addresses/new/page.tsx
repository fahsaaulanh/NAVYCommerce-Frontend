import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import AddressForm from "@/features/addresses/components/AddressForm";
import AddressPageShell from "@/features/addresses/components/AddressPageShell";

export const metadata: Metadata = { title: "Tambah Alamat | NAVYCommerce" };
export default async function NewAddressPage() {
  const user = await requireRole(["Customer"]);
  return <AddressPageShell title="Tambah alamat" description="Lengkapi penerima dan tujuan pengirimanmu." form>
    <AddressForm defaultRecipient={user.fullName} />
  </AddressPageShell>;
}
