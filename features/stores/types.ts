export type Store = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
};

export type StoreListResponse = {
  data: Store[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CreateStorePayload = {
  name: string;
  slug: string;
  description: string | null;
};

export type CreateStoreResponse = {
  code: string;
  message: string;
  data: Store;
};

export type CreateStoreState = {
  message?: string;
  errors?: Partial<Record<"name" | "slug" | "description", string>>;
};

export type StoreDetailResponse = {
  data: Store;
};
