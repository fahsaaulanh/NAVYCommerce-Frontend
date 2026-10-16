type IconName =
  | "plus"
  | "arrow-right"
  | "arrow-left"
  | "logout"
  | "store"
  | "search"
  | "filter"
  | "close"
  | "grid"
  | "user"
  | "box"
  | "cart"
  | "minus"
  | "trash";

type IconProps = {
  name: IconName;
  className?: string;
};

const paths: Record<IconName, string> = {
  cart: "M3 3h2l3 12h10l3-9H6M9 21h.01M18 21h.01M8 15l-1 3h12",
  minus: "M5 12h14",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  filter: "M4 7h16M7 12h10M10 17h4",
  close: "m6 6 12 12M18 6 6 18",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  user: "M20 21v-2a7 7 0 0 0-14 0v2M17 7A5 5 0 1 1 7 7a5 5 0 0 1 10 0",
  box: "m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9",
  plus: "M12 5v14M5 12h14",
  "arrow-right": "M5 12h14m-6-6 6 6-6 6",
  "arrow-left": "M19 12H5m6-6-6 6 6 6",
  logout: "M9 5H5v14h4M9 12h12m-4-4 4 4-4 4",
  store:
    "M3 10l2-6h14l2 6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 13v7h14v-7M10 20v-6h4v6",
};

export default function Icon({ name, className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 shrink-0 ${className}`}
    >
      <path d={paths[name]} />
    </svg>
  );
}
