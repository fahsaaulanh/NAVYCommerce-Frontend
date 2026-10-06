import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/guards";
import LogoutButton from "@/features/auth/LogoutButton";

export const metadata: Metadata = {
  title: "Akun Saya - NAVYCommerce",
};

const roleLabels = {
  Customer: "Customer",
  Seller: "Merchant",
  SuperAdmin: "Super Admin",
};

export default async function AccountPage() {
  const user = await requireUser();

  const details = [
    { label: "Nama Lengkap", value: user.fullName },
    { label: "Email", value: user.email },
    { label: "Peran", value: roleLabels[user.role] },
  ]

  return (
    <section
      aria-labelledby="account-title"
      className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-16"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
        Akun NAVYCommerce
      </p>

      <h1
        id="account-title"
        className="mt-3 text-3xl font-semibold tracking-tight text-foreground"
      >
        Akun saya
      </h1>

      <p className="mt-3 text-sm leading-6 text-muted">
        Informasi akun yang sedang kamu gunakan.
      </p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-4 border-b border-border p-6 sm:p-8">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary"
          >
            {user.fullName.charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-foreground">
              {user.fullName}
            </h2>

            <p className="mt-1 text-sm text-muted">
              {roleLabels[user.role]}
            </p>
          </div>
        </div>

        <dl className="divide-y divide-border px-6 sm:px-8">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="grid gap-2 py-5 sm:grid-cols-[160px_1fr] sm:gap-6"
            >
              <dt className="text-sm text-muted">
                {detail.label}
              </dt>

              <dd className="break-words text-sm font-medium text-foreground">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-background/50 p-6 sm:px-8">
          {user.role === "Seller" && (
            <Link href="/seller/stores" className="action-button">
              Toko Saya
            </Link>
          )}
          <Link
            href="/"
            className="rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary-hover"
          >
            Kembali ke beranda
          </Link>

          <LogoutButton />
        </div>
      </div>
    </section>
  );

}