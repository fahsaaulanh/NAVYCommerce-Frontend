import type { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/session";

export default async function StorefrontLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getSession();

  return (
    <>
      <Navbar user={user} />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col"
      >
        {children}
      </main>

      <Footer />
    </>
  );
}