export type UserRole = "Customer" | "Seller" | "SuperAdmin";

export type AuthResponse = {
  message?: string;
  token?: string;
  role?: UserRole;
  mockEmailInbox?: string;
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
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

const BASE_URL = (
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5175/api/Auth"
).replace(/\/$/, "");

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUserRole(value: unknown): value is UserRole {
  return value === "Customer" || value === "Seller" || value === "SuperAdmin";
}

function getMessage(body: unknown): string | undefined {
  if (typeof body === "string") {
    return body.trim() || undefined;
  }

  if (!isObject(body)) return undefined;

  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }

  if (isObject(body.errors)) {
    const messages = Object.values(body.errors)
      .flatMap((value) => (Array.isArray(value) ? value : []))
      .filter((value): value is string => typeof value === "string");

    if (messages.length > 0) return messages.join(" ");
  }

  if (typeof body.title === "string") {
    return body.title;
  }

  return undefined;
}

async function post(
  endpoint: string,
  payload: unknown,
  baseUrl: string = BASE_URL,
): Promise<AuthResponse> {
  let response: Response;
  let text: string;

  try {
    response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain",
      },
      body: JSON.stringify(payload),
    });

    text = await response.text();
  } catch {
    throw new AuthApiError(
      "Tidak dapat terhubung. Periksa koneksi dan pastikan backend berjalan.",
      0,
    );
  }

  let body: unknown = null;

  if (text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      if (response.headers.get("content-type")?.includes("text/plain")) {
        body = text;
      }
    }
  }

  const message = getMessage(body);

  if (!response.ok) {
    throw new AuthApiError(
      message || "Permintaan gagal. Silakan coba kembali.",
      response.status,
    );
  }

  const data = isObject(body) ? body : {};

  return {
    message,
    token: typeof data.token === "string" ? data.token : undefined,
    role: isUserRole(data.role) ? data.role : undefined,
    mockEmailInbox:
      typeof data.mockEmailInbox === "string" ? data.mockEmailInbox : undefined,
  };
}

export const authApi = {
  async register(payload: RegisterPayload) {
    if (payload.role !== 0 && payload.role !== 1) {
      throw new AuthApiError("Jenis akun harus Customer atau Seller.", 400);
    }

    return post("register", payload);
  },

  verifyOtp(email: string, otpCode: string) {
    return post("verify-otp", { email, otpCode });
  },

  async login(email: string, password: string) {
    const data = await post("login", { email, password }, "/api/auth");

    if (!data.role) {
      throw new AuthApiError("Respons login belum lengkap.", 502);
    }

    return data;
  },
};
