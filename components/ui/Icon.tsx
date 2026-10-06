type IconName = "plus" | "arrow-right" | "arrow-left" | "logout" | "store";

type IconProps = {
  name: IconName;
  className?: string;
};

const paths: Record<IconName, string> = {
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