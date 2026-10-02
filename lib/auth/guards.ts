import "server-only";

import { notFound, redirect } from "next/navigation";
import { getSession } from "./session";
import type { SessionUser } from "./session";

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    redirect("/auth");
  }
  return user;
}

export async function requireRole(
  allowedRoles: readonly SessionUser["role"][],
): Promise<SessionUser> {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    notFound();
  }

  return user;
}
