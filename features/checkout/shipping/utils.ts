import type { ShippingQuote, ShippingRate } from "./types";

const services: Record<string, readonly string[]> = {
  jnt: ["EZ"],
  sicepat: ["HALU", "REG"],
  jne: ["REG", "CTC"],
};
export const shippingRateKey = (rate: ShippingRate) =>
  JSON.stringify([rate.courierCode.toLowerCase(), rate.service.toUpperCase()]);

export function availableShippingRates(rates: ShippingRate[]): ShippingRate[] {
  const unique = new Map<string, ShippingRate>();
  for (const rate of [...rates].sort((a, b) => a.cost - b.cost)) {
    if (
      !services[rate.courierCode.toLowerCase()]?.includes(
        rate.service.toUpperCase(),
      )
    )
      continue;
    const key = shippingRateKey(rate);
    if (!unique.has(key)) unique.set(key, rate);
  }
  return [...unique.values()];
}

export function deliveryEstimate(value: string): string {
  const match = value
    .trim()
    .match(/^(\d+)(?:\s*-\s*(\d+))?\s*(?:days?|hari)?$/i);
  if (
    !match ||
    Number(match[1]) < 1 ||
    (match[2] && Number(match[2]) < Number(match[1]))
  )
    return "Estimasi belum tersedia";
  return match[2]
    ? `${Number(match[1])}–${Number(match[2])} hari`
    : `${Number(match[1])} hari`;
}

export function isShippingQuote(value: unknown): value is ShippingQuote {
  if (!value || typeof value !== "object") return false;
  const q = value as ShippingQuote;
  if (
    typeof q.addressId !== "string" ||
    typeof q.calculatedAt !== "string" ||
    !Number.isFinite(Date.parse(q.calculatedAt)) ||
    typeof q.isComplete !== "boolean" ||
    !Array.isArray(q.packages) ||
    q.packages.length < 1 ||
    q.packages.length > 5
  )
    return false;
  const stores = new Set<string>();
  for (const p of q.packages) {
    if (
      !p ||
      typeof p.storeId !== "string" ||
      stores.has(p.storeId) ||
      typeof p.storeName !== "string" ||
      typeof p.status !== "string" ||
      (p.message !== null && typeof p.message !== "string") ||
      !Number.isSafeInteger(p.weightGrams) ||
      p.weightGrams < 0 ||
      !Number.isFinite(p.itemsSubtotal) ||
      p.itemsSubtotal < 0 ||
      !Array.isArray(p.cartItemIds) ||
      !p.cartItemIds.length ||
      p.cartItemIds.some((id) => typeof id !== "string") ||
      !Array.isArray(p.rates)
    )
      return false;
    stores.add(p.storeId);
    for (const rate of p.rates) {
      if (
        !rate ||
        typeof rate.courierCode !== "string" ||
        typeof rate.courierName !== "string" ||
        typeof rate.service !== "string" ||
        typeof rate.description !== "string" ||
        typeof rate.estimatedDelivery !== "string" ||
        !Number.isFinite(rate.cost) ||
        rate.cost < 0
      )
        return false;
    }
  }
  return true;
}
