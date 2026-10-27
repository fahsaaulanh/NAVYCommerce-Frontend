import "server-only";

import { backendPublicGet } from "@/lib/api/public-server";
import { backendGet } from "@/lib/api/server";
import type { CategoryListResponse } from "./types";

export const categoryApi = {
  getPublic() {
    return backendPublicGet<CategoryListResponse>("/Categories");
  },
  getAll() {
    return backendGet<CategoryListResponse>("/Categories");
  },
};
