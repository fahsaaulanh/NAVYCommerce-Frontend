import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { BackendApiError } from "@/lib/api/server";
import { isAddressId } from "@/features/addresses/utils/validation";
import { loadCheckoutPreview } from "@/features/checkout/api/checkout-preview";
import {
  checkoutHref,
  parseCheckoutSelection,
} from "@/features/checkout/utils/selection";
import CheckoutRecovery from "@/features/checkout/orders/components/CheckoutRecovery";
import CheckoutView from "@/features/checkout/components/CheckoutView";
import CheckoutState from "@/features/checkout/components/CheckoutState";

export const metadata: Metadata = {
  title: "Checkout | NAVYCommerce",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    items?: string | string[];
    address?: string | string[];
  }>;
}) {
  const user = await requireRole(["Customer"]);
  const query = await searchParams;
  const ids = parseCheckoutSelection(query.items);
  if (!ids)
    return (
      <><CheckoutRecovery customerId={user.id} /><CheckoutState
        title="Pilih barang untuk checkout"
        message="Buka keranjang dan pilih barang yang ingin kamu proses."
      /></>
    );
  const requestedAddress =
    typeof query.address === "string" ? query.address.toLowerCase() : null;
  const loaded = await loadCheckoutPreview(ids).then(preview => ({ preview, error:null }))
    .catch((error: unknown) => {
      if (!(error instanceof BackendApiError)) throw error;
      return { preview:null, error };
    });
  if (loaded.error) return <><CheckoutRecovery customerId={user.id} /><CheckoutState
    title="Checkout belum dapat dimuat" message={loaded.error.message}
    status={loaded.error.status} retryHref={checkoutHref(ids)} /></>;
  const preview = loaded.preview!;
  const requestedIsValid =
    requestedAddress !== null &&
    isAddressId(requestedAddress) &&
    preview.addresses.some((address) => address.id === requestedAddress);
  const initialAddressId =
    query.address !== undefined
      ? requestedIsValid
        ? requestedAddress
        : null
      : (preview.addresses.find((address) => address.isDefault)?.id ?? null);
  return (
    <CheckoutView
      customerId={user.id}
      key={`${ids.join(",")}:${initialAddressId ?? "none"}`}
      preview={preview}
      initialAddressId={initialAddressId}
      invalidAddress={
        query.address !== undefined &&
        !requestedIsValid &&
        !preview.addressError
      }
    />
  );
}
