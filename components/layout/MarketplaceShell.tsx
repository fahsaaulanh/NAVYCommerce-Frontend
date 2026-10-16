import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { getCatalogCategories } from "@/features/products/api/catalog-api";
import MarketplaceNavbar from "./MarketplaceNavbar";
import MarketplaceFooter from "./MarketplaceFooter";
import styles from "./marketplace-shell.module.css";

export default async function MarketplaceShell({ children, workspace = false }: { children: ReactNode; workspace?: boolean }) {
  const [user, categories] = await Promise.all([
    getSession(),
    getCatalogCategories().catch(() => []),
  ]);
  const content = <>
    <MarketplaceNavbar user={user} categories={categories} />
    <main id="main-content" tabIndex={-1} className={`flex flex-1 flex-col ${workspace ? styles.main : ""}`}>{children}</main>
  </>;

  return <>
    {workspace ? <div className={styles.workspace}>{content}</div> : content}
    {workspace ? <div className={styles.footer}><MarketplaceFooter /></div> : <MarketplaceFooter />}
  </>;
}
