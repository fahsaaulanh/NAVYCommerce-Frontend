// Hanya izinkan tujuan lokal pada pathname yang secara eksplisit disetujui.
export function safeReturnTo(raw: unknown, allowedPaths: readonly string[]): string | undefined {
  if (typeof raw !== "string" || raw.length > 5000 || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return;
  try {
    const origin = "https://navycommerce.invalid";
    const url = new URL(raw, origin);
    if (url.origin !== origin || !allowedPaths.includes(url.pathname)) return;
    return url.pathname + url.search;
  } catch { return; }
}
