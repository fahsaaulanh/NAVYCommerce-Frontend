import "server-only";

import { backendGet } from "@/lib/api/server";
import type { CategoryListResponse } from "./types";

export const categoryApi = {
  getAll() {
    return backendGet<CategoryListResponse>("/Categories");
  },
};
