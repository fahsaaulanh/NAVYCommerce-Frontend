import type { CartItem } from "../types/cart";

export function groupCartItems(items: readonly CartItem[]) {
  const groups = new Map<string, { name: string; items: CartItem[] }>();
  for (const item of items) {
    const group = groups.get(item.storeId) ?? { name: item.storeName, items: [] };
    group.items.push(item);
    groups.set(item.storeId, group);
  }
  return groups;
}
