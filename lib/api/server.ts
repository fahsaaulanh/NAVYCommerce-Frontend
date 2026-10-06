import "server-only";

import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

async function backendRequest<T>(
  path: string,
  method: "GET" | "POST",
  body?: unknown,
): Promise<T> {
  const user = await getSession();

  if (!user) {
    throw new BackendApiError("Silakan login kembali.", 401);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    throw new BackendApiError("Silakan login kembali.", 401);
  }

  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("BACKEND_API_URL belum dikonfigurasi.");
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Path backend tidak valid.");
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new BackendApiError(
      "Backend tidak dapat dihubungi. Silakan coba kembali.",
      503,
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  const data: Record<string, unknown> =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  if (!response.ok) {
    const fieldErrors: Record<string, string[]> = {};

    if (
      data.errors &&
      typeof data.errors === "object" &&
      !Array.isArray(data.errors)
    ) {
      for (const [field, messages] of Object.entries(data.errors)) {
        if (Array.isArray(messages)) {
          fieldErrors[field] = messages.filter(
            (message): message is string => typeof message === "string",
          );
        }
      }
    }

    const fallback =
      response.status === 401
        ? "Session tidak diterima backend. Silakan login kembali."
        : response.status === 403
          ? "Kamu tidak memiliki izin untuk melakukan tindakan ini."
          : "Permintaan gagal. Silakan coba kembali.";

    throw new BackendApiError(
      response.status >= 500
        ? fallback
        : typeof data.message === "string"
          ? data.message
          : fallback,
      response.status,
      typeof data.code === "string" ? data.code : undefined,
      fieldErrors,
    );
  }

  if (raw === null) {
    throw new BackendApiError("Respons backend tidak dapat dibaca.", 502);
  }

  return raw as T;
}

export function backendGet<T>(path: string): Promise<T> {
  return backendRequest<T>(path, "GET");
}

export function backendPost<T>(path: string, body: unknown): Promise<T> {
  return backendRequest<T>(path, "POST", body);
}
