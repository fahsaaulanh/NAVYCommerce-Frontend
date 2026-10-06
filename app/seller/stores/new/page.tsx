import type { Metadata } from "next";

import { requireRole } from "@/lib/auth/guards";
import CreateStoreForm from "@/features/stores/CreateStoreForm";

export const metadata: Metadata = {
  title: "Buat Toko | NAVYCommerce",
};

export default async function NewStorePage() {
  await requireRole(["Seller"]);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          Ruang seller
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Buat toko
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Siapkan identitas toko sebagai tempat menjual produkmu.
        </p>
      </header>

      <div className="mt-8 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <CreateStoreForm />
      </div>
    </section>
  );
}