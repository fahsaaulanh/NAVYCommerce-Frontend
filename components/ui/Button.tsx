import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "icon";
  icon?: ReactNode;
};

export default function Button({
  children,
  loading = false,
  disabled,
  variant = "primary",
  size = "md",
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
      className={[
        "action-button",
        `action-button--${variant}`,
        `action-button--${size}`,
        className,
      ].join(" ")}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
        />
      ) : icon ? (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center"
        >
          {icon}
        </span>
      ) : null}

      <span className={size === "icon" ? "sr-only" : undefined}>
        {loading ? "Memproses…" : children}
      </span>
    </button>
  );
}