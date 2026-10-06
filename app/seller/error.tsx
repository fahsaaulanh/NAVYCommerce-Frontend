"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SellerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold">
          Halaman belum dapat dimuat
        </h1>

        <p role="alert" className="mt-3 text-sm leading-6 text-muted">
          Terjadi kendala saat mengambil data. Silakan coba kembali.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={reset}>Coba kembali</Button>

          <Link
            href="/account"
            className="rounded-xl px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Kembali ke akun
          </Link>
        </div>
      </div>
    </section>
  );
}