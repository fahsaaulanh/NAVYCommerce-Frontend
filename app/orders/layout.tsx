import type { ReactNode } from "react";
import MarketplaceShell from "@/components/layout/MarketplaceShell";
import AccountLayout from "@/features/account/components/AccountLayout";
export default function OrdersLayout({ children }: { children:ReactNode }) {
  return <MarketplaceShell><AccountLayout>{children}</AccountLayout></MarketplaceShell>;
}
