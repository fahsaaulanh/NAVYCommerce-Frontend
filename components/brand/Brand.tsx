type BrandProps = { inverse?: boolean };

export default function Brand({ inverse = false }: BrandProps) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8h14l1 12H4L5 8Z" />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
        </svg>
      </span>
      <span className={`text-lg font-bold tracking-tight ${inverse ? 'text-on-panel' : 'text-foreground'}`}>
        NAVY<span className="bg-linear-to-r from-brand-start to-brand-end bg-clip-text text-transparent">Commerce</span>
      </span>
    </span>
  );
}
