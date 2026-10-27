"use client";
import { isCreateOrderPayload } from "./validation";
import { isGuid } from "@/lib/validation";
import type { CreateOrderPayload } from "../types";
export type CheckoutIntent = { payload: CreateOrderPayload; orderId?: string };
const eventName = "navy-checkout-intent";
const storageKey = (customerId: string) => `navy:checkout:${customerId}`;
export function readIntent(customerId: string): string | null {
  try { return window.sessionStorage.getItem(storageKey(customerId)); } catch { return null; }
}
export function parseIntent(raw: string | null): CheckoutIntent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as CheckoutIntent;
    return isCreateOrderPayload(value.payload) && (value.orderId === undefined || isGuid(value.orderId)) ? value : null;
  } catch { return null; }
}
export function saveIntent(customerId: string, value: CheckoutIntent | null): boolean {
  try {
    if (value) window.sessionStorage.setItem(storageKey(customerId), JSON.stringify(value));
    else window.sessionStorage.removeItem(storageKey(customerId));
    window.dispatchEvent(new Event(eventName));
    return true;
  } catch { return false; }
}
export function subscribeIntent(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(eventName, callback); window.removeEventListener("storage", callback); };
}
