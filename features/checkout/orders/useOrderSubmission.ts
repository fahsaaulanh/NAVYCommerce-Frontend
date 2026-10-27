"use client";
import { useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "./actions/order-actions";
import { parseIntent, readIntent, saveIntent, subscribeIntent } from "./utils/intent-store";
import type { CreateOrderPayload, OrderActionResult } from "./types";

const activeCustomers = new Set<string>();

export function useOrderSubmission(customerId: string) {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeIntent, () => readIntent(customerId), () => null);
  const intent = parseIntent(raw);
  const [pending, startTransition] = useTransition();
  const [failure, setFailure] = useState<Extract<OrderActionResult, { ok: false }> | null>(null);
  const busy = useRef(false);
  const unresolved = !!intent && !intent.orderId;
  function submit(input?: Omit<CreateOrderPayload, "idempotencyKey">) {
    if (busy.current || activeCustomers.has(customerId)) return;
    const existing = parseIntent(readIntent(customerId));
    const payload = existing && !existing.orderId ? existing.payload
      : input ? { ...input, idempotencyKey: crypto.randomUUID() } : null;
    if (!payload) return;
    if (!saveIntent(customerId, { payload })) {
      setFailure({ ok: false, uncertain: false, message: "Izinkan penyimpanan sesi browser agar percobaan ulang pesanan tetap aman." });
      return;
    }
    busy.current = true;
    activeCustomers.add(customerId);
    setFailure(null);
    startTransition(async () => {
      try {
        const result = await createOrderAction(payload);
        if (result.ok) {
          saveIntent(customerId, { payload, orderId: result.data.id });
          router.push(`/orders/${result.data.id}`);
          router.refresh();
        } else {
          if (!result.uncertain && !result.authRequired) saveIntent(customerId, null);
          setFailure(result);
        }
      } catch {
        setFailure({ ok: false, uncertain: true, message: "Koneksi terputus. Coba lagi untuk memeriksa pesanan yang sama." });
      } finally { busy.current = false; activeCustomers.delete(customerId); }
    });
  }
  return { pending, failure, unresolved, intent, submit };
}
