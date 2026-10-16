"use client";

import { useEffect, useState } from "react";
import { regionParents } from "../types/region";
import type { RegionLevel, RegionOption } from "../types/region";

type Result = { key: string; options: RegionOption[]; error: string | null };

export function useRegionOptions(level: RegionLevel, parentCode = "") {
  const [result, setResult] = useState<Result>({ key: "", options: [], error: null });
  const [attempt, setAttempt] = useState(0);
  const enabled = level === "provinces" || !!parentCode;
  const key = `${level}:${parentCode}:${attempt}`;

  useEffect(() => {
    if (level !== "provinces" && !parentCode) return;
    const controller = new AbortController();
    let current = true;
    const query = level === "provinces" ? "" : `?${new URLSearchParams({ [regionParents[level].parameter]: parentCode })}`;
    async function load() {
      try {
        const response = await fetch(`/api/regions/${level}${query}`, {
          cache: "no-store", signal: controller.signal,
        });
        const raw: unknown = await response.json();
        const payload = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
        if (!response.ok) throw new Error(typeof payload.message === "string" ? payload.message : "Daftar wilayah belum dapat dimuat.");
        if (!Array.isArray(payload.data)) throw new Error("Respons wilayah tidak dapat dibaca.");
        const options = payload.data.filter((item): item is RegionOption => !!item &&
          typeof item === "object" && typeof item.code === "string" && typeof item.name === "string" &&
          (item.postalCode === null || typeof item.postalCode === "string"));
        if (options.length !== payload.data.length) throw new Error("Respons wilayah tidak dapat dibaca.");
        if (current) setResult({ key, options, error: null });
      } catch (error) {
        if (current && !controller.signal.aborted)
          setResult({ key, options: [], error: error instanceof Error ? error.message : "Daftar wilayah belum dapat dimuat." });
      }
    }
    void load();
    return () => { current = false; controller.abort(); };
  }, [level, parentCode, key]);

  const matched = result.key === key;
  return {
    options: enabled && matched ? result.options : [],
    loading: enabled && !matched,
    error: enabled && matched ? result.error : null,
    retry: () => setAttempt(value => value + 1),
  };
}
