import "server-only";

import { backendDelete, backendGet, backendPost, backendPut } from "@/lib/api/server";
import type { AddressListResponse, AddressMutationResponse, SaveAddressPayload } from "../types/address";

const path = (id: string) => `/CustomerAddresses/${encodeURIComponent(id)}`;

export const addressApi = {
  getMine: () => backendGet<AddressListResponse>("/CustomerAddresses/mine"),
  create: (payload: SaveAddressPayload) => backendPost<AddressMutationResponse>("/CustomerAddresses", payload),
  update: (id: string, payload: SaveAddressPayload) => backendPut<AddressMutationResponse>(path(id), payload),
  setDefault: (id: string) => backendPut<AddressMutationResponse>(`${path(id)}/default`, {}),
  remove: (id: string) => backendDelete<AddressMutationResponse>(path(id)),
};
