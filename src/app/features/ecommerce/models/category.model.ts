export interface Category {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string | null;
  parentId?: number | null;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string | null;
  parentId?: number | null;
}