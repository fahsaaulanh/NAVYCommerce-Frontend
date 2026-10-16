import "server-only";

import { backendGet } from "@/lib/api/server";
import { regionParents } from "../types/region";
import type { RegionLevel, RegionListResponse } from "../types/region";

export const regionApi = {
  getOptions(level: RegionLevel, parentCode?: string) {
    if (level === "provinces") return backendGet<RegionListResponse>("/Regions/provinces");
    const parent = regionParents[level];
    if (!parentCode || !parent.pattern.test(parentCode)) throw new Error("Kode induk wilayah tidak valid.");
    const query = new URLSearchParams({ [parent.parameter]: parentCode });
    return backendGet<RegionListResponse>(`/Regions/${level}?${query}`);
  },
};
