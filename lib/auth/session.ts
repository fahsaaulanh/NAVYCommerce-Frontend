import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "navy_session";

const SESSION_MAX_AGE = 60 * 60 * 2;

export async function createSession(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}
