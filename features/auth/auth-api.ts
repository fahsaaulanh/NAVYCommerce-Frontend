export type AuthRole = "Customer" | "Seller" | "SuperAdmin";

export type AuthResponse = {
  message?: string;
  code?: string;
  role?: AuthRole;
  mockEmailInbox?: string;
  expiresAt?: string;
  retryAfterSeconds?: number;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: number;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

const BASE_URL = (
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000/api/Auth"
).replace(/\/+$/, "");

function getMessage(data: Record<string, unknown>): string | undefined {
  if (typeof data.message === "string") return data.message;

  if (data.errors && typeof data.errors === "object") {
    const messages = Object.values(
      data.errors as Record<string, unknown>,
    ).flatMap((value) =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [],
    );

    if (messages.length) return messages.join(" ");
  }

  return typeof data.title === "string" ? data.title : undefined;
}

function getSeconds(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.ceil(value)
    : undefined;
}

async function post(
  endpoint: string,
  payload: unknown,
  baseUrl = BASE_URL,
): Promise<AuthResponse> {
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthApiError(
      "Tidak dapat terhubung. Periksa koneksi dan pastikan backend berjalan.",
      0,
    );
  }

  const text = await response.text();
  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch {
    raw = response.headers.get("Content-Type")?.includes("text/plain")
      ? text
      : null;
  }

  const data: Record<string, unknown> =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const message = typeof raw === "string" ? raw : getMessage(data);
  const code = typeof data.code === "string" ? data.code : undefined;

  const retryHeader = response.headers.get("Retry-After");
  const retryAfterSeconds =
    getSeconds(data.retryAfterSeconds) ??
    (retryHeader !== null ? getSeconds(Number(retryHeader)) : undefined);

  if (!response.ok) {
    throw new AuthApiError(
      message || "Permintaan gagal. Silakan coba kembali.",
      response.status,
      code,
      retryAfterSeconds,
    );
  }

  const role =
    data.role === "Customer" ||
    data.role === "Seller" ||
    data.role === "SuperAdmin"
      ? data.role
      : undefined;

  return {
    message,
    code,
    role,
    retryAfterSeconds,
    expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : undefined,
    mockEmailInbox:
      typeof data.mockEmailInbox === "string" ? data.mockEmailInbox : undefined,
  };
}

export const authApi = {
  async login(email: string, password: string) {
    const data = await post("login", { email, password }, "/api/auth");

    if (!data.role) {
      throw new AuthApiError("Respons login tidak valid.", 502);
    }

    return data;
  },

  register: (payload: RegisterPayload) => post("register", payload),

  verifyOtp: (email: string, otpCode: string) =>
    post("verify-otp", { email, otpCode }),

  resendOtp: (email: string) => post("resend-otp", { email }),
};
