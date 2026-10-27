"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import Icon from "./Icon";
export default function RefreshButton({ label = "Perbarui", className = "" }: { label?: string; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <Button variant="outline" size="sm" className={className} loading={pending} onClick={() => startTransition(() => router.refresh())} icon={<Icon name="refresh" />}>{label}</Button>;
}
