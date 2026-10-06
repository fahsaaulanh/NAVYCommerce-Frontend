import "server-only";

import { backendGet, backendPost } from "@/lib/api/server";
import type {
  CreateStorePayload,
  CreateStoreResponse,
  StoreDetailResponse,
  StoreListResponse,
} from "./types";

export const storeApi = {
  getMine(page = 1, pageSize = 20) {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    return backendGet<StoreListResponse>(`/Stores/mine?${query.toString()}`);
  },

  getById(id: string) {
    return backendGet<StoreDetailResponse>(`/Stores/${encodeURIComponent(id)}`);
  },

  create(payload: CreateStorePayload) {
    return backendPost<CreateStoreResponse>("/Stores", payload);
  },
};
