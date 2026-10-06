import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
};

export default function Button({
  children,
  loading = false,
  disabled,
  variant = "primary",
  icon,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`action-button action-button--${variant} ${className}`}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
        />
      ) : (
        icon
      )}

      <span>{loading ? "Memproses…" : children}</span>
    </button>
  );
}