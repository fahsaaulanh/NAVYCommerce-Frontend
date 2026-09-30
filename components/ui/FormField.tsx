import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  endAdornment?: ReactNode;
};

export default function FormField({ id, label, hint, endAdornment, className = "", placeholder, ...props }: FormFieldProps) {
  const describedBy = [props['aria-describedby'], hint ? `${id}-hint` : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <div className="relative">
        <input {...props} id={id} placeholder={placeholder || " "} aria-describedby={describedBy}
          className={`form-input ${endAdornment ? 'form-input--adorned' : ''} ${className}`} />
        <label htmlFor={id} className="form-label">{label}</label>
        {endAdornment && <div className="absolute right-3 top-1/2 -translate-y-1/2">{endAdornment}</div>}
      </div>
      {hint && <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-muted">{hint}</p>}
    </div>
  );
}
