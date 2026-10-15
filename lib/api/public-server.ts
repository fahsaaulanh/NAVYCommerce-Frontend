import "server-only";

import { BackendApiError } from "./server";

export async function backendPublicGet<T>(path: string): Promise<T> {
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
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new BackendApiError(
      "Katalog belum dapat dihubungi. Silakan coba kembali.",
      503,
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new BackendApiError(
      "Katalog belum dapat dimuat. Silakan coba kembali.",
      response.status,
    );
  }

  if (raw === null) {
    throw new BackendApiError("Respons katalog tidak dapat dibaca.", 502);
  }

  return raw as T;
}
