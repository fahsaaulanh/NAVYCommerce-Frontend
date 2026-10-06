import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth/guards";
import SellerShell from "@/components/layout/SellerShell";

export default async function SellerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await requireRole(["Seller"]);

  return (
    <SellerShell fullName={user.fullName}>
      {children}
    </SellerShell>
  );
}