import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  const expectedOrigin =
    process.env.APP_ORIGIN ||
    (process.env.NODE_ENV === "development"
      ? new URL(request.url).origin
      : null);

  if (!expectedOrigin) {
    return json(
      { message: "Konfigurasi origin aplikasi belum tersedia." },
      500,
    );
  }

  if (!origin || origin !== expectedOrigin) {
    return json({ message: "Origin request tidak sesuai." }, 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ message: "Request harus berupa JSON." }, 415);
  }

  const body: unknown = await request.json().catch(() => null);

  if (
    !isObject(body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return json({ message: "Email dan password harus berupa teks." }, 400);
  }

  const baseUrl = process.env.AUTH_API_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    return json({ message: "Konfigurasi alamat backend belum tersedia." }, 500);
  }

  let backendResponse: Response;
  let data: unknown;

  try {
    backendResponse = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    data = await backendResponse.json();
  } catch {
    return json(
      { message: "Backend tidak dapat dihubungi atau responsnya tidak valid." },
      502,
    );
  }

  if (!backendResponse.ok) {
    return json(
      {
        message:
          isObject(data) && typeof data.message === "string"
            ? data.message
            : "Login gagal. Silakan coba kembali.",
      },
      backendResponse.status,
    );
  }

  if (
    !isObject(data) ||
    typeof data.token !== "string" ||
    !data.token.trim() ||
    !["Customer", "Seller", "SuperAdmin"].includes(String(data.role))
  ) {
    return json({ message: "Respons login backend belum lengkap." }, 502);
  }

  await createSession(data.token);

  return json({
    message: "Login successful",
    role: data.role,
  });
}
