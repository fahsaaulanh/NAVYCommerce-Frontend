import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { isGuid } from "@/lib/validation";
import { BackendApiError } from "@/lib/api/server";
import { orderApi } from "@/features/orders/api/order-api";
import { isOrderReceipt } from "@/features/checkout/orders/utils/validation";
import OrderDetails from "@/features/orders/components/OrderDetails";
import AccountPageState from "@/features/account/components/AccountPageState";
export const metadata: Metadata = { title: "Pesanan | NAVYCommerce", robots: { index:false, follow:false } };
export default async function OrderPage({ params }: { params: Promise<{ checkoutId: string }> }) {
  await requireRole(["Customer"]);
  const { checkoutId } = await params;
  if (!isGuid(checkoutId)) notFound();
  const result = await orderApi.getById(checkoutId).then(response => ({ response, error:null }))
    .catch((error: unknown) => {
      if (!(error instanceof BackendApiError)) throw error;
      return { response:null, error };
    });
  if (result.error?.status === 404) notFound();
  if (result.error) return <AccountPageState title="Pesanan belum dapat dimuat" message={result.error.message} status={result.error.status} retryHref={`/orders/${checkoutId}`} />;
  if (!isOrderReceipt(result.response?.data)) return <AccountPageState title="Pesanan belum dapat dimuat" message="Respons pesanan belum dapat dibaca. Perbarui halaman untuk memeriksa statusnya." retryHref={`/orders/${checkoutId}`} />;
  const order = result.response.data;
  return <OrderDetails key={`${order.id}:${order.paymentStatus}`} receipt={order} />;
}
