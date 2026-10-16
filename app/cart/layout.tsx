import type { ReactNode } from "react";
import MarketplaceShell from "@/components/layout/MarketplaceShell";

export default function CartLayout({ children }: { children: ReactNode }) {
  return <MarketplaceShell workspace>{children}</MarketplaceShell>;
}
