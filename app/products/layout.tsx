import type { ReactNode } from "react";
import MarketplaceShell from "@/components/layout/MarketplaceShell";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <MarketplaceShell>{children}</MarketplaceShell>;
}
