"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import AuthPanel from "./AuthPanel";
import { authApi, AuthApiError } from "./auth-api";
import { useRouter } from "next/navigation";
import type { AuthResponse } from "./auth-api";
import useOtpCooldown from "./useOtpCooldown";
import PasswordRequirements from "./components/PasswordRequirements";

import {
  getPasswordValidation,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_BYTES,
} from "./password-rules";

type View = 'LOGIN' | 'REGISTER' | 'OTP';
type Message = { text: string; error: boolean };
const copy = {
  LOGIN: { title: 'Selamat datang kembali', subtitle: 'Masuk untuk melanjutkan perjalananmu.' },
  REGISTER: { title: 'Mulai bersama kami', subtitle: 'Buat akun untuk berbelanja atau membuka peluang usaha.' },
  OTP: { title: 'Verifikasi email', subtitle: 'Masukkan kode 6 digit yang dikirim ke email kamu.' },
};

export default function AuthPage() {
  const router = useRouter();

  const [view, setView] = useState<View>("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const { remainingSeconds, startCooldown } = useOtpCooldown();
  const loading = submitting || resending;
  const passwordValidation = getPasswordValidation(password);

  function switchView(next: View) {
    if (loading) return;

    setView(next);
    setMessage(null);
    setPassword("");
    setShowPassword(false);
    setOtpCode("");
  }

  function getSuccessMessage(
    data: AuthResponse,
    fallback: string,
  ): string {
    const text = data.message || fallback;

    if (
      process.env.NODE_ENV === "development" &&
      data.mockEmailInbox
    ) {
      return `${text} (${data.mockEmailInbox})`;
    }

    return text;
  }

  function openVerification() {
    if (loading) return;

    if (!email.trim()) {
      setMessage({
        text: "Isi email akun yang ingin diverifikasi terlebih dahulu.",
        error: true,
      });
      return;
    }

    setEmail(email.trim());
    switchView("OTP");
  }

  async function resendOtp() {
    if (loading || remainingSeconds > 0) return;

    const accountEmail = email.trim();

    if (!accountEmail) {
      setMessage({ text: "Email wajib diisi.", error: true });
      return;
    }

    setResending(true);
    setMessage(null);

    try {
      const data = await authApi.resendOtp(accountEmail);

      setEmail(accountEmail);
      setOtpCode("");
      startCooldown(data.retryAfterSeconds ?? 60);

      setMessage({
        text: getSuccessMessage(
          data,
          "OTP baru telah diterbitkan. Periksa email kamu.",
        ),
        error: false,
      });
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 429) {
        startCooldown(error.retryAfterSeconds ?? 60);
      }

      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Gagal meminta OTP baru.",
        error: true,
      });
    } finally {
      setResending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    if (view === "REGISTER" && !passwordValidation.valid) {
      setMessage({
        text: passwordValidation.withinByteLimit
          ? "Lengkapi persyaratan password sebelum membuat akun."
          : `Password maksimal ${PASSWORD_MAX_BYTES} byte UTF-8.`,
        error: true,
      });

      document.getElementById("password")?.focus();
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const accountEmail = email.trim();

    try {
      if (view === "REGISTER") {
        const data = await authApi.register({
          email: accountEmail,
          password,
          fullName: fullName.trim(),
          phoneNumber: "",
          role,
        });

        setEmail(accountEmail);
        setView("OTP");
        setPassword("");
        setShowPassword(false);
        setOtpCode("");
        startCooldown(data.retryAfterSeconds ?? 60);

        setMessage({
          text: getSuccessMessage(
            data,
            "Akun berhasil dibuat. Silakan verifikasi email.",
          ),
          error: false,
        });
      } else if (view === "OTP") {
        const data = await authApi.verifyOtp(accountEmail, otpCode);

        setView("LOGIN");
        setOtpCode("");
        setPassword("");

        setMessage({
          text:
            data.message ||
            "Email berhasil diverifikasi. Silakan masuk.",
          error: false,
        });
      } else {
        await authApi.login(accountEmail, password);

        setPassword("");
        router.replace("/account");
        router.refresh();
      }
    } catch (error) {
      if (
        view === "REGISTER" &&
        error instanceof AuthApiError &&
        error.code === "AUTH_VERIFICATION_REQUIRED"
      ) {
        setEmail(accountEmail);
        setView("OTP");
        setPassword("");
        setShowPassword(false);
        setOtpCode("");
      }

      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan. Silakan coba kembali.",
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="auth-title" className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 -z-10 size-96 rounded-full bg-brand-end/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 -z-10 size-96 rounded-full bg-accent/15 blur-3xl" />
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_24px_80px_-32px_rgba(24,36,61,0.3)] lg:grid-cols-[0.9fr_1.1fr]">
        <AuthPanel />
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary">Akun NAVYCommerce</p>
            <h1 id="auth-title" className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">{copy[view].title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{copy[view].subtitle}</p>
            {view === 'OTP' && <p className="mt-2 break-all text-sm font-semibold text-foreground">{email}</p>}

            {view !== "OTP" && (
              <div
                role="group"
                aria-label="Pilih form akun"
                className="mt-7 border-b border-border"
              >
                <div className="relative grid grid-cols-2">
                  {(
                    [
                      { key: "LOGIN", label: "Masuk" },
                      { key: "REGISTER", label: "Daftar" },
                    ] as const
                  ).map((item) => {
                    const active = view === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={active}
                        disabled={loading}
                        onClick={() => switchView(item.key)}
                        className={`relative min-h-12 px-4 pb-4 pt-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${active
                            ? "text-primary"
                            : "text-muted hover:text-foreground"
                          }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}

                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute bottom-0 left-0 h-0.5 w-1/2 rounded-full bg-primary transition-transform duration-200 ease-out motion-reduce:transition-none ${view === "REGISTER" ? "translate-x-full" : ""
                      }`}
                  />
                </div>
              </div>
            )}

            {message && (
              <div role={message.error ? 'alert' : 'status'} className={`mt-6 rounded-xl border p-4 text-sm leading-6 ${message.error ? 'border-danger/20 bg-danger-soft text-danger' : 'border-success/20 bg-success-soft text-success'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={submit} aria-busy={loading} className="mt-7">
              <fieldset disabled={loading} className="space-y-5">
                <legend className="sr-only">{copy[view].title}</legend>
                {view === 'REGISTER' && <FormField id="full-name" label="Nama lengkap" minLength={2}
                  maxLength={100} autoComplete="name" required value={fullName}
                  onChange={event => setFullName(event.target.value)} placeholder="Nama lengkap kamu" pattern=".*\S.*" />}
                {view !== 'OTP' && <FormField id="email" label="Email" maxLength={254} type="email" autoComplete="email" required value={email}
                  onChange={event => setEmail(event.target.value)} placeholder="nama@contoh.com" />}
                {view !== "OTP" && (
                  <div>
                    <FormField
                      id="password"
                      label="Password"
                      minLength={
                        view === "REGISTER" ? PASSWORD_MIN_LENGTH : undefined
                      }
                      maxLength={
                        view === "REGISTER" ? PASSWORD_MAX_BYTES : undefined
                      }
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        view === "LOGIN" ? "current-password" : "new-password"
                      }
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={
                        view === "LOGIN"
                          ? "Masukkan password"
                          : "Buat password"
                      }
                      aria-describedby={
                        view === "REGISTER"
                          ? "password-requirements"
                          : undefined
                      }
                      endAdornment={
                        <button
                          type="button"
                          aria-controls="password"
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword(!showPassword)}
                          className="rounded-lg px-2 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary-hover"
                        >
                          {showPassword ? "Sembunyikan" : "Tampilkan"}
                          <span className="sr-only"> password</span>
                        </button>
                      }
                    />

                    {view === "REGISTER" && (
                      <PasswordRequirements
                        validation={passwordValidation}
                        started={password.length > 0}
                      />
                    )}
                  </div>
                )}
                {view === 'REGISTER' && (
                  <div>
                    <label htmlFor="account-role" className="mb-2 block text-sm font-semibold text-foreground">Jenis akun</label>
                    <select id="account-role" value={role} onChange={event => setRole(Number(event.target.value))}
                      className="min-h-12 w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-base text-foreground transition-colors hover:border-primary/35 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10">
                      <option value={0}>Customer — saya ingin berbelanja</option>
                      <option value={1}>Merchant — saya ingin berjualan</option>
                    </select>
                  </div>
                )}
                {view === 'OTP' && <FormField id="otp-code" label="Kode verifikasi" type="text" inputMode="numeric" autoComplete="one-time-code"
                  pattern="[0-9]{6}" maxLength={6} required value={otpCode} placeholder="000000" hint="Masukkan 6 digit angka dari email verifikasi."
                  onChange={event => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center font-mono text-2xl tracking-[0.35em]" />}
                <Button type="submit" loading={submitting}
                  disabled={
                    loading ||
                    (view === "REGISTER" && !passwordValidation.valid) ||
                    (view === "OTP" && !/^\d{6}$/.test(otpCode))
                  } className="w-full">
                  {view === 'LOGIN' ? 'Masuk ke akun' : view === 'REGISTER' ? 'Buat akun' : 'Verifikasi email'}
                </Button>
              </fieldset>
            </form>
            <div className="mt-7 border-t border-border pt-5 text-center text-sm text-muted">
              {view === "OTP" ? (
                <div className="space-y-4">
                  <p>
                    Kode kedaluwarsa atau belum menerima kode?
                  </p>

                  <Button
                    type="button"
                    loading={resending}
                    disabled={loading || remainingSeconds > 0}
                    onClick={resendOtp}
                    className="w-full"
                  >
                    {remainingSeconds > 0
                      ? `Kirim ulang dalam ${remainingSeconds} detik`
                      : "Kirim ulang OTP"}
                  </Button>

                  <p className="text-xs leading-5">
                    Setelah meminta kode baru, gunakan OTP terbaru.
                  </p>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => switchView("LOGIN")}
                    className="rounded-lg px-2 py-1 font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary-hover disabled:opacity-60"
                  >
                    Kembali ke login
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p>
                    {view === "LOGIN"
                      ? "Belum punya akun?"
                      : "Sudah punya akun?"}{" "}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        switchView(view === "LOGIN" ? "REGISTER" : "LOGIN")
                      }
                      className="rounded-lg px-2 py-1 font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary-hover disabled:opacity-60"
                    >
                      {view === "LOGIN" ? "Daftar sekarang" : "Masuk di sini"}
                    </button>
                  </p>

                  {view === "LOGIN" && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={openVerification}
                      className="rounded-lg px-2 py-1 font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary-hover disabled:opacity-60"
                    >
                      Akun belum aktif? Lanjutkan verifikasi
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
