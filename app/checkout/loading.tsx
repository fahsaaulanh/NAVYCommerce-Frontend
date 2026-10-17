import Skeleton from "@/components/ui/Skeleton";

export default function CheckoutLoading() {
  return <div className="mx-auto w-full max-w-7xl p-6" role="status" aria-label="Memuat checkout">
    <Skeleton className="h-10 w-56" />
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
      <div className="space-y-5"><Skeleton className="h-52 w-full" /><Skeleton className="h-72 w-full" /></div>
      <Skeleton className="h-80 w-full" />
    </div>
  </div>;
}
