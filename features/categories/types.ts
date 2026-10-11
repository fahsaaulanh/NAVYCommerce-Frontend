export type Category = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
};

export type CategoryListResponse = Category[];
