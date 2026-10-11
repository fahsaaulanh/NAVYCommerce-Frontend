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

type BackendMethod = "GET" | "POST" | "PUT" | "DELETE";

async function backendRequest<T>(
  path: string,
  method: BackendMethod,
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

  const isMultipart = body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  if (body !== undefined && !isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isMultipart
            ? body
            : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(isMultipart ? 30_000 : 10_000),
    });
  } catch {
    throw new BackendApiError(
      "Respons backend tidak diterima. Periksa hasil tindakan sebelum mencoba kembali.",
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
          : response.status === 413
            ? "Ukuran file melebihi batas yang diizinkan."
            : response.status >= 500
              ? "Backend mengalami kendala. Silakan coba kembali."
              : "Permintaan gagal. Silakan periksa data yang dikirim.";

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

export function backendPut<T>(path: string, body: unknown): Promise<T> {
  return backendRequest<T>(path, "PUT", body);
}

export function backendDelete<T>(path: string): Promise<T> {
  return backendRequest<T>(path, "DELETE");
}

export function backendUpload<T>(path: string, body: FormData): Promise<T> {
  return backendRequest<T>(path, "POST", body);
}
