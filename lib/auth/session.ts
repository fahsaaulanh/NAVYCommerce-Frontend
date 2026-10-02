import "server-only";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "navy_session";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: "Customer" | "Seller" | "SuperAdmin";
};

function getJwtConfig() {
  const secret = process.env.AUTH_JWT_SECRET;
  const issuer = process.env.AUTH_JWT_ISSUER;
  const audience = process.env.AUTH_JWT_AUDIENCE;

  if (!secret || !issuer || !audience) {
    throw new Error("Konfigurasi JWT frontend belum lengkap.");
  }

  return {
    key: new TextEncoder().encode(secret),
    issuer,
    audience,
  };
}

async function verifyToken(token: string) {
  const { key, issuer, audience } = getJwtConfig();

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer,
      audience,
      requiredClaims: ["sub", "email", "exp", "Role"],
    });

    const role = payload.Role;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      (role !== "Customer" && role !== "Seller" && role !== "SuperAdmin")
    ) {
      return null;
    }

    const user: SessionUser = {
      id: payload.sub,
      email: payload.email,
      fullName:
        typeof payload.FullName === "string" && payload.FullName.trim()
          ? payload.FullName
          : payload.email,
      role,
    };

    return {
      user,
      expiresAt: new Date(payload.exp * 1000),
    };
  } catch {
    // Token tidak valid atau sudah kedaluwarsa.
    return null;
  }
}

export async function createSession(token: string) {
  const session = await verifyToken(token);

  if (!session) {
    throw new Error("Token backend tidak dapat diverifikasi.");
  }

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await verifyToken(token);

  return session?.user ?? null;
}

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}
