import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export default function Button({ children, loading = false, disabled, className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button {...props} type={type} disabled={disabled || loading} aria-busy={loading}
      className={`action-button ${className}`}>
      {loading && <span aria-hidden="true" className="size-4 rounded-full border-2 border-on-primary/40 border-t-on-primary motion-safe:animate-spin" />}
      {loading ? "Memproses…" : children}
    </button>
  );
}
