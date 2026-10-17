import "server-only";
import { backendGet, backendPut } from "@/lib/api/server";
import type {
  SaveStoreShippingOriginPayload,
  StoreShippingOriginResponse,
  StoreShippingOriginMutationResponse,
} from "./types";

const path = (storeId: string) =>
  `/Stores/${encodeURIComponent(storeId)}/shipping-origin`;
export const storeShippingOriginApi = {
  get(storeId: string) {
    return backendGet<StoreShippingOriginResponse>(path(storeId));
  },
  save(storeId: string, payload: SaveStoreShippingOriginPayload) {
    return backendPut<StoreShippingOriginMutationResponse>(
      path(storeId),
      payload,
    );
  },
};
