type Props = { name: "pin" | "edit" | "check"; className?: string };
const paths = {
  pin: "M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  edit: "m16 3 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15l-1 5Z",
  check: "m5 12 4 4L19 6",
};
export default function AddressSymbol({ name, className = "" }: Props) {
  return <svg aria-hidden="true" className={`size-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
