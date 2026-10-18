"use client";

import { useRef, useState, useTransition } from "react";
import type { CartItem } from "@/features/cart/types/cart";
import { calculateShippingAction } from "./actions";
import { availableShippingRates, shippingRateKey } from "./utils";
import type { ShippingActionResult, ShippingQuote } from "./types";

type QuoteState = { key: string; result: ShippingActionResult | null; choices: Record<string, string> };

export function useCheckoutShipping(contextKey: string, addressId: string | null, items: CartItem[]) {
  const [state, setState] = useState<QuoteState>({ key: "", result: null, choices: {} });
  const [pending, startTransition] = useTransition();
  const requestId = useRef(0);
  const current = state.key === contextKey ? state : null;
  const quote: ShippingQuote | null = current?.result?.ok ? current.result.data : null;
  const failure = current?.result?.ok === false ? current.result : null;
  const selected = quote?.packages.map(p => availableShippingRates(p.rates)
    .find(rate => shippingRateKey(rate) === current?.choices[p.storeId])) ?? [];
  const selectedCount = selected.filter(Boolean).length;
  const complete = !!quote && quote.isComplete &&
    quote.packages.every(p => p.status === "READY") && selectedCount === quote.packages.length;
  const cost = selected.reduce((sum, rate) => sum + (rate?.cost ?? 0), 0);

  function calculate() {
    if (!addressId || pending) return;
    const capturedKey = contextKey;
    const id = ++requestId.current;
    setState({ key: capturedKey, result: null, choices: {} });
    startTransition(async () => {
      let result: ShippingActionResult;
      try {
        result = await calculateShippingAction(addressId, items.map(item => item.id));
        if (result.ok) {
          // Tolak subtotal/kelompok yang sudah berubah dibanding data halaman.
          const expected = new Map<string, number>();
          for (const item of items) expected.set(item.storeId, (expected.get(item.storeId) ?? 0) + item.lineTotal);
          if (result.data.packages.length !== expected.size || result.data.packages.some(p =>
              !expected.has(p.storeId) || Math.abs(expected.get(p.storeId)! - p.itemsSubtotal) > .005 ||
              p.cartItemIds.some(id => !items.some(item => item.id === id && item.storeId === p.storeId))))
            result = { ok: false, message: "Harga atau kelompok barang berubah. Perbarui data checkout untuk melihat nilai terbaru.", refreshRequired: true };
        }
      } catch {
        result = { ok: false, message: "Pilihan pengiriman belum dapat dimuat. Silakan coba kembali." };
      }
      if (id === requestId.current) setState({ key: capturedKey, result, choices: {} });
    });
  }

  function choose(storeId: string, key: string) {
    if (pending || !quote) return;
    const p = quote.packages.find(p => p.storeId === storeId && p.status === "READY");
    if (!p || !availableShippingRates(p.rates).some(rate => shippingRateKey(rate) === key)) return;
    setState(previous => previous.key !== contextKey ? previous :
      { ...previous, choices: { ...previous.choices, [storeId]: key } });
  }
  return { quote, failure, pending, choices: current?.choices ?? {}, selectedCount, complete, cost, calculate, choose };
}
