import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import { isAddressId } from "@/features/addresses/utils/validation";
import { loadCheckoutPreview } from "@/features/checkout/api/checkout-preview";
import { checkoutHref, parseCheckoutSelection } from "@/features/checkout/utils/selection";
import CheckoutView from "@/features/checkout/components/CheckoutView";
import CheckoutState from "@/features/checkout/components/CheckoutState";

export const metadata: Metadata = { title: "Checkout | NAVYCommerce", robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ items?: string | string[]; address?: string | string[] }> }) {
  await requireRole(["Customer"]);
  const query = await searchParams;
  const ids = parseCheckoutSelection(query.items);
  if (!ids) return <CheckoutState title="Pilih barang untuk checkout" message="Buka keranjang dan pilih barang yang ingin kamu proses." />;
  const requestedAddress = typeof query.address === "string" ? query.address.toLowerCase() : null;
  let preview;
  try { preview = await loadCheckoutPreview(ids); }
  catch (error) {
    if (!(error instanceof BackendApiError)) throw error;
    return <CheckoutState title="Checkout belum dapat dimuat" message={error.message} status={error.status} retryHref={checkoutHref(ids)} />;
  }
  const requestedIsValid = requestedAddress !== null && isAddressId(requestedAddress) && preview.addresses.some(address => address.id === requestedAddress);
  const initialAddressId = query.address !== undefined
    ? requestedIsValid ? requestedAddress : null
    : preview.addresses.find(address => address.isDefault)?.id ?? null;
  return <CheckoutView key={`${ids.join(",")}:${initialAddressId ?? "none"}`} preview={preview} initialAddressId={initialAddressId}
    invalidAddress={query.address !== undefined && !requestedIsValid && !preview.addressError} />;
}
