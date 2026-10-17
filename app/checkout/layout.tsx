import type { ReactNode } from "react";
import MarketplaceShell from "@/components/layout/MarketplaceShell";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <MarketplaceShell workspace>{children}</MarketplaceShell>;
}
