import type { PasswordValidation } from "./../password-rules";
import { PASSWORD_MAX_BYTES } from "./../password-rules";

type Props = {
  validation: PasswordValidation;
  started: boolean;
};

export default function PasswordRequirements({
  validation,
  started,
}: Props) {
  const {
    requirements,
    completed,
    valid,
    withinByteLimit,
  } = validation;

  return (
    <div
      id="password-requirements"
      className="mt-3 rounded-2xl border border-border bg-background/60 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p
          aria-live="polite"
          className={`text-xs font-semibold ${
            valid ? "text-success" : "text-foreground"
          }`}
        >
          {valid
            ? "Password memenuhi persyaratan"
            : "Persyaratan password"}
        </p>

        <span className="shrink-0 text-xs text-muted">
          {completed}/{requirements.length}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="mt-3 flex gap-1.5"
      >
        {requirements.map((item) => (
          <span
            key={item.id}
            className={`h-1 flex-1 rounded-full transition-colors motion-reduce:transition-none ${
              item.met ? "bg-success" : "bg-border"
            }`}
          />
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {requirements.map((item) => (
          <li
            key={item.id}
            className={`flex items-start gap-2 text-xs leading-5 ${
              item.met ? "text-success" : "text-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                item.met
                  ? "bg-success/10"
                  : "border border-border"
              }`}
            >
              {item.met && (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              )}
            </span>

            <span>
              <span className="sr-only">
                {item.met ? "Terpenuhi: " : "Belum terpenuhi: "}
              </span>

              {item.label}
            </span>
          </li>
        ))}
      </ul>

      {started && !withinByteLimit && (
        <p
          role="alert"
          className="mt-3 border-t border-border pt-3 text-xs leading-5 text-danger"
        >
          Password melebihi {PASSWORD_MAX_BYTES} byte. Emoji dan
          beberapa karakter khusus menggunakan lebih dari satu byte.
        </p>
      )}
    </div>
  );
}