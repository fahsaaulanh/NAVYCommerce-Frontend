import { redirect } from "next/navigation";

import AuthPage from "@/features/auth/AuthPage";
import { getSession } from "@/lib/auth/session";

export default async function Page() {
  const user = await getSession();

  if (user) {
    redirect("/account");
  }

  return <AuthPage />;
}