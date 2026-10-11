import type { SVGProps } from "react";

const paths = {
  back: "M19 12H5m7-7-7 7 7 7",
  refresh: "M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 18 17",
  image: "M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M9 8h.01",
  box: "m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9",
  layers: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  check: "m5 12 4 4L19 6",
  alert: "m12 3 10 18H2L12 3ZM12 9v4M12 17h.01",
  upload: "M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4",
  edit: "m16 3 5 5M4 16 16 4a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  order: "M4 7h12M4 12h9M4 17h6M19 10v10m-3-3 3 3 3-3",
  up: "M12 19V5m-6 6 6-6 6 6",
  down: "M12 5v14m-6-6 6 6 6-6",
} as const;

type ProductIconProps = SVGProps<SVGSVGElement> & {
  name: keyof typeof paths;
};

export default function ProductIcon({
  name,
  className = "size-5",
  ...props
}: ProductIconProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}