/** Helpers lintas fitur. Tidak bergantung pada modul alamat atau toko. */
export function isGuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) &&
    value !== "00000000-0000-0000-0000-000000000000";
}

export function normalizeFieldErrors(errors: Record<string, string[]>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(errors)) {
    const field = key.split(".").at(-1) ?? key;
    const name = field.charAt(0).toLowerCase() + field.slice(1);
    result[name] = [...(result[name] ?? []), ...messages];
  }
  return result;
}
